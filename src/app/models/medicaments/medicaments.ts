export interface Medicaments {
    id?: string,
    nom_commercial?: string,
    nom_generique?: string,
    categorie?: string,
    forme?: string,
    dosage?: string[],
    quantite_dispo?: number,
    seuil_minimum?: number,
    date_peremption?: string,
    date_entree_stock?: string,
    date_approvisionnement?: string
    nom_fournisseur?: string,
    contact?: string | undefined,
    adresse_email?: string | undefined
}
