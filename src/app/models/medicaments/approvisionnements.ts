export interface Approvisionnements {
    id?: string; // ajouté localement
    nom_produit: string;
    dosage: string;
    quantite_total: number;
    date_peremption: string;
    seuil_minimum: number;
}
