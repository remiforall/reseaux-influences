-- =============================================================================
-- Réseaux d'Influence — Schéma de base de données PostgreSQL
-- Version : 1.0
-- Description : Schéma complet avec système de gamification et modération
-- =============================================================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Pour la recherche floue (trigrams)

-- =============================================================================
-- 1. UTILISATEURS ET GAMIFICATION
-- =============================================================================

CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    pseudo VARCHAR(100) UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(512),
    role VARCHAR(50) DEFAULT 'contributeur' CHECK (role IN ('contributeur', 'moderateur', 'admin')),

    -- Gamification
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    niveau VARCHAR(50) DEFAULT 'debutant' CHECK (niveau IN ('debutant', 'intermediaire', 'expert', 'moderateur')),
    validations_effectuees INTEGER DEFAULT 0 CHECK (validations_effectuees >= 0),
    soumissions_effectuees INTEGER DEFAULT 0 CHECK (soumissions_effectuees >= 0),
    soumissions_acceptees INTEGER DEFAULT 0 CHECK (soumissions_acceptees >= 0),
    taux_precision DECIMAL(5,2) DEFAULT 0.00,  -- Pourcentage de concordance avec le consensus

    -- Métadonnées
    est_actif BOOLEAN DEFAULT TRUE,
    date_inscription TIMESTAMPTZ DEFAULT NOW(),
    derniere_connexion TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seuil de validations requises avant de pouvoir soumettre
-- Configurable via variable : par défaut 5
COMMENT ON TABLE utilisateurs IS 'Seuil de soumission : validations_effectuees >= 5';

-- =============================================================================
-- 2. PERSONNES PUBLIQUES
-- =============================================================================

CREATE TABLE personnes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    nom_complet VARCHAR(512) GENERATED ALWAYS AS (
        CASE WHEN prenom IS NOT NULL THEN prenom || ' ' || nom ELSE nom END
    ) STORED,
    pays VARCHAR(100),
    nationalite VARCHAR(100),
    date_naissance DATE,
    role_principal VARCHAR(255),  -- ex: "politique", "journaliste", "chef d'entreprise"
    roles_secondaires TEXT[],     -- ex: {"lobbyiste", "consultant"}
    bio TEXT,
    photo_url VARCHAR(512),
    wikipedia_url VARCHAR(512),
    wikidata_id VARCHAR(50),      -- Identifiant Wikidata pour interopérabilité

    -- Métadonnées de contribution
    cree_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete', 'archive')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. SOURCES MÉDIATIQUES
-- =============================================================================

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url VARCHAR(1024) NOT NULL,
    titre TEXT NOT NULL,
    media VARCHAR(255),           -- ex: "Le Monde", "BBC", "Reuters"
    type_media VARCHAR(100),      -- ex: "presse_ecrite", "television", "radio", "web", "document_officiel"
    langue VARCHAR(10) DEFAULT 'fr',
    pays_media VARCHAR(100),
    date_publication DATE,
    date_consultation DATE,       -- Date à laquelle la source a été consultée
    auteur VARCHAR(255),
    description TEXT,

    -- Vérification
    verifiee BOOLEAN DEFAULT FALSE,
    verifiee_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    verifiee_le TIMESTAMPTZ,

    -- Métadonnées
    cree_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(url, date_publication)
);

-- =============================================================================
-- 4. TYPES DE LIENS (référentiel)
-- =============================================================================

CREATE TABLE types_liens (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,   -- ex: "famille", "politique", "economique"
    libelle VARCHAR(255) NOT NULL,      -- ex: "Lien familial", "Lien politique"
    description TEXT,
    categorie VARCHAR(100),             -- ex: "personnel", "professionnel", "institutionnel"
    icone VARCHAR(50),                  -- ex: nom d'icône pour le frontend
    couleur VARCHAR(7)                  -- ex: "#FF5733" pour la visualisation du graphe
);

-- Données de référence : types de liens prédéfinis
INSERT INTO types_liens (code, libelle, description, categorie, couleur) VALUES
    ('famille',        'Lien familial',           'Relation familiale (mariage, parenté, etc.)',           'personnel',       '#E74C3C'),
    ('amitie',         'Amitié / Proximité',      'Relation amicale ou de proximité connue',              'personnel',       '#F39C12'),
    ('politique',      'Lien politique',          'Collaboration politique, parti, coalition',             'professionnel',   '#3498DB'),
    ('economique',     'Lien économique',         'Relation d''affaires, actionnariat, conseil',          'professionnel',   '#2ECC71'),
    ('mediatique',     'Lien médiatique',         'Collaboration médiatique, co-publication',             'professionnel',   '#9B59B6'),
    ('institutionnel', 'Lien institutionnel',     'Relation via institution, ONG, fondation',             'institutionnel',  '#1ABC9C'),
    ('academique',     'Lien académique',         'Co-scolarité, mentorat, recherche commune',            'institutionnel',  '#34495E'),
    ('financement',    'Financement / Mécénat',   'Financement, don, mécénat, sponsoring',                'professionnel',   '#E67E22'),
    ('lobbying',       'Lobbying / Influence',    'Activité de lobbying ou d''influence directe',         'professionnel',   '#C0392B'),
    ('juridique',      'Lien juridique',          'Affaire judiciaire commune, avocat, procès',           'institutionnel',  '#7F8C8D');

-- =============================================================================
-- 5. LIENS D'INFLUENCE
-- =============================================================================

CREATE TABLE liens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personne_a_id UUID NOT NULL REFERENCES personnes(id) ON DELETE CASCADE,
    personne_b_id UUID NOT NULL REFERENCES personnes(id) ON DELETE CASCADE,
    type_lien_id INTEGER NOT NULL REFERENCES types_liens(id),
    description TEXT,
    date_debut DATE,              -- Date de début de la relation (si connue)
    date_fin DATE,                -- Date de fin (NULL si toujours active)
    est_bidirectionnel BOOLEAN DEFAULT TRUE,  -- La relation est-elle symétrique ?
    intensite INTEGER DEFAULT 1 CHECK (intensite BETWEEN 1 AND 5),  -- Force du lien (1=faible, 5=fort)

    -- Source de preuve
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,

    -- Modération
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete', 'archive', 'conteste')),
    nb_validations_vrai INTEGER DEFAULT 0,
    nb_validations_faux INTEGER DEFAULT 0,
    nb_validations_indecis INTEGER DEFAULT 0,
    score_confiance DECIMAL(5,2) DEFAULT 0.00,  -- Score calculé à partir des validations

    -- Métadonnées de contribution
    cree_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    modere_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    modere_le TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Contraintes
    CHECK (personne_a_id != personne_b_id),
    UNIQUE(personne_a_id, personne_b_id, type_lien_id, source_id)
);

-- =============================================================================
-- 6. VALIDATIONS COMMUNAUTAIRES
-- =============================================================================

CREATE TABLE validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    lien_id UUID NOT NULL REFERENCES liens(id) ON DELETE CASCADE,
    verdict VARCHAR(10) NOT NULL CHECK (verdict IN ('vrai', 'faux', 'indecis')),
    commentaire TEXT,
    source_supplementaire VARCHAR(1024),  -- L'utilisateur peut ajouter une source supplémentaire

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Un utilisateur ne peut valider un lien qu'une seule fois
    UNIQUE(utilisateur_id, lien_id)
);

-- =============================================================================
-- 7. BADGES DE GAMIFICATION
-- =============================================================================

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(100) NOT NULL,  -- ex: "validation", "soumission", "media", "relation", "special"
    icone_url VARCHAR(512),
    couleur VARCHAR(7),

    -- Conditions d'attribution (stockées en JSONB pour flexibilité)
    conditions JSONB NOT NULL,
    -- Exemples de conditions :
    -- {"type": "validations", "seuil": 50}
    -- {"type": "validations_media", "media": "Le Monde", "seuil": 10}
    -- {"type": "validations_type_lien", "type_lien": "politique", "seuil": 5}
    -- {"type": "precision", "seuil": 0.8, "min_validations": 100}
    -- {"type": "soumissions_acceptees", "seuil": 20}

    est_actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges prédéfinis
INSERT INTO badges (code, nom, description, categorie, conditions, couleur) VALUES
    -- Badges de validation
    ('verificateur_bronze',    'Vérificateur Bronze',     'A validé au moins 10 liens',                            'validation',  '{"type": "validations", "seuil": 10}',                              '#CD7F32'),
    ('verificateur_argent',    'Vérificateur Argent',     'A validé au moins 50 liens',                            'validation',  '{"type": "validations", "seuil": 50}',                              '#C0C0C0'),
    ('verificateur_or',        'Vérificateur Or',         'A validé au moins 200 liens',                           'validation',  '{"type": "validations", "seuil": 200}',                             '#FFD700'),
    ('moderateur',             'Modérateur',              'A validé 100+ liens avec une précision de 80%+',        'validation',  '{"type": "precision", "seuil": 0.8, "min_validations": 100}',       '#8E44AD'),

    -- Badges de soumission
    ('contributeur_bronze',    'Contributeur Bronze',     'A soumis 5 liens acceptés',                             'soumission',  '{"type": "soumissions_acceptees", "seuil": 5}',                     '#CD7F32'),
    ('contributeur_argent',    'Contributeur Argent',     'A soumis 20 liens acceptés',                            'soumission',  '{"type": "soumissions_acceptees", "seuil": 20}',                    '#C0C0C0'),
    ('contributeur_or',        'Contributeur Or',         'A soumis 100 liens acceptés',                           'soumission',  '{"type": "soumissions_acceptees", "seuil": 100}',                   '#FFD700'),

    -- Badges par type de média
    ('expert_presse',          'Expert Presse',           'A validé 10+ liens sourcés par la presse écrite',       'media',       '{"type": "validations_type_media", "type_media": "presse_ecrite", "seuil": 10}',  '#2980B9'),
    ('expert_tv',              'Expert Télévision',       'A validé 10+ liens sourcés par la télévision',          'media',       '{"type": "validations_type_media", "type_media": "television", "seuil": 10}',     '#E74C3C'),
    ('expert_documents',       'Expert Documents',        'A validé 10+ liens sourcés par des documents officiels','media',       '{"type": "validations_type_media", "type_media": "document_officiel", "seuil": 10}','#27AE60'),

    -- Badges par type de relation
    ('expert_politique',       'Expert Politique',        'A validé 10+ liens de type politique',                  'relation',    '{"type": "validations_type_lien", "type_lien": "politique", "seuil": 10}',        '#3498DB'),
    ('expert_economique',      'Expert Économique',       'A validé 10+ liens de type économique',                 'relation',    '{"type": "validations_type_lien", "type_lien": "economique", "seuil": 10}',       '#2ECC71'),
    ('expert_familial',        'Expert Familial',         'A validé 10+ liens de type familial',                   'relation',    '{"type": "validations_type_lien", "type_lien": "famille", "seuil": 10}',          '#E74C3C'),
    ('expert_lobbying',        'Expert Lobbying',         'A validé 10+ liens de type lobbying',                   'relation',    '{"type": "validations_type_lien", "type_lien": "lobbying", "seuil": 10}',         '#C0392B'),

    -- Badges spéciaux
    ('pionnier',               'Pionnier',                'Parmi les 100 premiers inscrits',                       'special',     '{"type": "inscription_rang", "seuil": 100}',                        '#F39C12'),
    ('premier_lien',           'Premier Lien',            'A soumis son premier lien accepté',                     'special',     '{"type": "soumissions_acceptees", "seuil": 1}',                     '#1ABC9C');

-- Table d'association : badges attribués aux utilisateurs
CREATE TABLE utilisateurs_badges (
    id SERIAL PRIMARY KEY,
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    attribue_le TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(utilisateur_id, badge_id)
);

-- =============================================================================
-- 8. HISTORIQUE DES MODIFICATIONS (versioning)
-- =============================================================================

CREATE TABLE historique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entite_type VARCHAR(50) NOT NULL,  -- 'personne', 'lien', 'source'
    entite_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('creation', 'modification', 'suppression', 'validation', 'moderation')),
    donnees_avant JSONB,
    donnees_apres JSONB,
    utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. SIGNALEMENTS
-- =============================================================================

CREATE TABLE signalements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entite_type VARCHAR(50) NOT NULL,  -- 'personne', 'lien', 'source', 'utilisateur'
    entite_id UUID NOT NULL,
    signale_par UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    raison VARCHAR(100) NOT NULL CHECK (raison IN ('inexact', 'diffamatoire', 'doublon', 'spam', 'autre')),
    description TEXT,
    statut VARCHAR(20) DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'rejete')),
    traite_par UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    traite_le TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. CONFIGURATION DE LA GAMIFICATION
-- =============================================================================

CREATE TABLE config_gamification (
    cle VARCHAR(100) PRIMARY KEY,
    valeur VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO config_gamification (cle, valeur, description) VALUES
    ('seuil_validations_pour_soumettre', '5',    'Nombre minimum de validations avant de pouvoir soumettre un lien'),
    ('points_par_validation',            '1',    'Points gagnés par validation effectuée'),
    ('points_par_soumission_acceptee',   '5',    'Points gagnés quand un lien soumis est validé par la communauté'),
    ('points_par_soumission_rejetee',    '-2',   'Points perdus quand un lien soumis est rejeté'),
    ('seuil_niveau_intermediaire',       '50',   'Points requis pour le niveau intermédiaire'),
    ('seuil_niveau_expert',              '200',  'Points requis pour le niveau expert'),
    ('seuil_niveau_moderateur',          '500',  'Points requis pour le niveau modérateur'),
    ('nb_validations_consensus',         '5',    'Nombre de validations avant qu''un lien change de statut automatiquement'),
    ('seuil_consensus_validation',       '0.7',  'Ratio vrai/(vrai+faux) requis pour valider automatiquement un lien'),
    ('seuil_consensus_rejet',            '0.7',  'Ratio faux/(vrai+faux) requis pour rejeter automatiquement un lien');

-- =============================================================================
-- 11. INDEX POUR LES PERFORMANCES
-- =============================================================================

-- Recherche de personnes
CREATE INDEX idx_personnes_nom ON personnes(nom);
CREATE INDEX idx_personnes_nom_complet ON personnes(nom_complet);
CREATE INDEX idx_personnes_nom_trgm ON personnes USING gin(nom gin_trgm_ops);
CREATE INDEX idx_personnes_pays ON personnes(pays);
CREATE INDEX idx_personnes_statut ON personnes(statut);

-- Recherche de liens
CREATE INDEX idx_liens_personne_a ON liens(personne_a_id);
CREATE INDEX idx_liens_personne_b ON liens(personne_b_id);
CREATE INDEX idx_liens_type ON liens(type_lien_id);
CREATE INDEX idx_liens_statut ON liens(statut);
CREATE INDEX idx_liens_cree_par ON liens(cree_par);
CREATE INDEX idx_liens_score ON liens(score_confiance DESC);

-- Validations
CREATE INDEX idx_validations_utilisateur ON validations(utilisateur_id);
CREATE INDEX idx_validations_lien ON validations(lien_id);

-- Sources
CREATE INDEX idx_sources_media ON sources(media);
CREATE INDEX idx_sources_type ON sources(type_media);
CREATE INDEX idx_sources_url ON sources(url);

-- Historique
CREATE INDEX idx_historique_entite ON historique(entite_type, entite_id);
CREATE INDEX idx_historique_utilisateur ON historique(utilisateur_id);
CREATE INDEX idx_historique_date ON historique(created_at DESC);

-- Badges
CREATE INDEX idx_utilisateurs_badges_utilisateur ON utilisateurs_badges(utilisateur_id);
CREATE INDEX idx_utilisateurs_badges_badge ON utilisateurs_badges(badge_id);

-- Signalements
CREATE INDEX idx_signalements_entite ON signalements(entite_type, entite_id);
CREATE INDEX idx_signalements_statut ON signalements(statut);

-- =============================================================================
-- 12. FONCTIONS UTILITAIRES
-- =============================================================================

-- Fonction : mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER trg_utilisateurs_updated_at BEFORE UPDATE ON utilisateurs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_personnes_updated_at BEFORE UPDATE ON personnes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_liens_updated_at BEFORE UPDATE ON liens FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fonction : vérifier le seuil de validations avant soumission
CREATE OR REPLACE FUNCTION verifier_seuil_soumission()
RETURNS TRIGGER AS $$
DECLARE
    seuil INTEGER;
    nb_validations INTEGER;
BEGIN
    SELECT valeur::INTEGER INTO seuil FROM config_gamification WHERE cle = 'seuil_validations_pour_soumettre';
    SELECT validations_effectuees INTO nb_validations FROM utilisateurs WHERE id = NEW.cree_par;

    IF nb_validations < seuil THEN
        RAISE EXCEPTION 'Vous devez valider au moins % liens avant de pouvoir soumettre.', seuil;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verifier_seuil_soumission
    BEFORE INSERT ON liens
    FOR EACH ROW
    EXECUTE FUNCTION verifier_seuil_soumission();

-- Fonction : mettre à jour les compteurs après une validation
CREATE OR REPLACE FUNCTION maj_compteurs_validation()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrémenter le compteur de validations de l'utilisateur
    UPDATE utilisateurs
    SET validations_effectuees = validations_effectuees + 1,
        points = points + (SELECT valeur::INTEGER FROM config_gamification WHERE cle = 'points_par_validation')
    WHERE id = NEW.utilisateur_id;

    -- Mettre à jour les compteurs du lien
    IF NEW.verdict = 'vrai' THEN
        UPDATE liens SET nb_validations_vrai = nb_validations_vrai + 1 WHERE id = NEW.lien_id;
    ELSIF NEW.verdict = 'faux' THEN
        UPDATE liens SET nb_validations_faux = nb_validations_faux + 1 WHERE id = NEW.lien_id;
    ELSE
        UPDATE liens SET nb_validations_indecis = nb_validations_indecis + 1 WHERE id = NEW.lien_id;
    END IF;

    -- Recalculer le score de confiance du lien
    UPDATE liens
    SET score_confiance = CASE
        WHEN (nb_validations_vrai + nb_validations_faux) > 0
        THEN (nb_validations_vrai::DECIMAL / (nb_validations_vrai + nb_validations_faux)) * 100
        ELSE 0
    END
    WHERE id = NEW.lien_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maj_compteurs_validation
    AFTER INSERT ON validations
    FOR EACH ROW
    EXECUTE FUNCTION maj_compteurs_validation();

-- Fonction : auto-validation/rejet d'un lien par consensus
CREATE OR REPLACE FUNCTION verifier_consensus_lien()
RETURNS TRIGGER AS $$
DECLARE
    nb_total INTEGER;
    seuil_nb INTEGER;
    seuil_ratio DECIMAL;
    ratio_vrai DECIMAL;
    ratio_faux DECIMAL;
BEGIN
    SELECT valeur::INTEGER INTO seuil_nb FROM config_gamification WHERE cle = 'nb_validations_consensus';

    nb_total := NEW.nb_validations_vrai + NEW.nb_validations_faux + NEW.nb_validations_indecis;

    IF nb_total >= seuil_nb AND NEW.statut = 'en_attente' THEN
        SELECT valeur::DECIMAL INTO seuil_ratio FROM config_gamification WHERE cle = 'seuil_consensus_validation';

        IF (NEW.nb_validations_vrai + NEW.nb_validations_faux) > 0 THEN
            ratio_vrai := NEW.nb_validations_vrai::DECIMAL / (NEW.nb_validations_vrai + NEW.nb_validations_faux);
            ratio_faux := NEW.nb_validations_faux::DECIMAL / (NEW.nb_validations_vrai + NEW.nb_validations_faux);

            IF ratio_vrai >= seuil_ratio THEN
                NEW.statut := 'valide';
            END IF;

            SELECT valeur::DECIMAL INTO seuil_ratio FROM config_gamification WHERE cle = 'seuil_consensus_rejet';
            IF ratio_faux >= seuil_ratio THEN
                NEW.statut := 'rejete';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verifier_consensus_lien
    BEFORE UPDATE ON liens
    FOR EACH ROW
    EXECUTE FUNCTION verifier_consensus_lien();
