// Emission factors: kg CO2 saved per kg of material diverted from landfill
// Sources: IPCC AR6, EPA WARM model, ICE Database v3.0
export const EMISSION_FACTORS: Record<string, number> = {
  concrete:   0.159,
  metal:      1.460,
  steel:      1.460,
  wood:       0.446,
  glass:      0.540,
  plastic:    1.960,
  brick:      0.213,
  asphalt:    0.040,
  gypsum:     0.120,
  insulation: 1.350,
  ceramic:    0.530,
  rubber:     1.870,
};

// kWh energy saved per kg recycled vs virgin production
export const ENERGY_FACTORS: Record<string, number> = {
  concrete:   0.10,
  metal:      8.00,
  steel:      8.00,
  wood:       0.50,
  glass:      0.80,
  plastic:    5.00,
  brick:      0.30,
  asphalt:    0.20,
  gypsum:     0.15,
  insulation: 2.00,
  ceramic:    0.70,
  rubber:     3.50,
};

export function detectMaterialKey(listing: any): string {
  const text = ((listing.title || '') + ' ' + (listing.materials?.[0]?.type || '')).toLowerCase();
  return Object.keys(EMISSION_FACTORS).find(k => text.includes(k)) ?? 'concrete';
}

/** Total weight in kg — uses explicit weight_kg set during publishing */
export function getWeightKg(listing: any): number {
  if (listing.weight_kg && parseFloat(listing.weight_kg) > 0) return parseFloat(listing.weight_kg);
  if (listing.materials?.length) {
    const total = listing.materials.reduce((s: number, m: any) => s + (parseFloat(m.weight_kg) || 0), 0);
    if (total > 0) return total;
  }
  return 0;
}

export function calcCarbonSavedKg(listing: any): number {
  return getWeightKg(listing) * EMISSION_FACTORS[detectMaterialKey(listing)];
}

export function calcEnergySavedKwh(listing: any): number {
  return getWeightKg(listing) * ENERGY_FACTORS[detectMaterialKey(listing)];
}

export function totalCarbonSavedKg(listings: any[]): number {
  return listings.reduce((sum, l) => sum + calcCarbonSavedKg(l), 0);
}

export function totalEnergySavedKwh(listings: any[]): number {
  return listings.reduce((sum, l) => sum + calcEnergySavedKwh(l), 0);
}

export function totalWeightKg(listings: any[]): number {
  return listings.reduce((sum, l) => sum + getWeightKg(l), 0);
}
