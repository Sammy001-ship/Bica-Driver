
export interface LocationData {
  id: string;
  display_name: string;
  description: string; // usually Area, LGA
  lat: number;
  lon: number;
  category: 'LGA' | 'Airport' | 'Hotel' | 'Shopping' | 'Residential' | 'Commercial' | 'Tourism' | 'Education' | 'Transport' | 'District' | 'Health' | 'Landmark';
  aliases?: string[];
}

// Approximate Lagos Boundaries
const LAGOS_BOUNDS = {
  minLat: 6.3,
  maxLat: 6.8,
  minLon: 2.7,
  maxLon: 4.2
};

const LAGOS_DATABASE: LocationData[] = [
  // LGAs
  { id: 'lga_ikeja', display_name: 'Ikeja', description: 'Lagos State Capital', lat: 6.6018, lon: 3.3515, category: 'LGA', aliases: ['Capital'] },
  { id: 'lga_eti_osa', display_name: 'Eti-Osa', description: 'Lagos Island', lat: 6.4400, lon: 3.5400, category: 'LGA' },
  { id: 'lga_lagos_island', display_name: 'Lagos Island', description: 'Isale Eko', lat: 6.4549, lon: 3.4246, category: 'LGA', aliases: ['Isale Eko'] },
  { id: 'lga_surulere', display_name: 'Surulere', description: 'Lagos Mainland', lat: 6.4975, lon: 3.3653, category: 'LGA' },
  { id: 'lga_yaba', display_name: 'Yaba', description: 'Lagos Mainland', lat: 6.5163, lon: 3.3768, category: 'LGA', aliases: ['Tech Hub'] },
  { id: 'lga_ikorodu', display_name: 'Ikorodu', description: 'Lagos East', lat: 6.6194, lon: 3.5105, category: 'LGA' },
  { id: 'lga_epe', display_name: 'Epe', description: 'Lagos East', lat: 6.5841, lon: 3.9834, category: 'LGA' },
  { id: 'lga_badagry', display_name: 'Badagry', description: 'Lagos West', lat: 6.4316, lon: 2.8876, category: 'LGA' },
  { id: 'lga_oshodi', display_name: 'Oshodi-Isolo', description: 'Lagos Mainland', lat: 6.5530, lon: 3.3440, category: 'LGA' },
  
  // Transport Hubs
  { id: 'tr_mmia', display_name: 'Murtala Muhammed Int. Airport', description: 'Ikeja', lat: 6.5774, lon: 3.3210, category: 'Airport', aliases: ['MMIA', 'International Airport'] },
  { id: 'tr_mma2', display_name: 'MMA2 Terminal', description: 'Ikeja', lat: 6.5732, lon: 3.3338, category: 'Airport', aliases: ['Local Airport'] },
  { id: 'tr_oshodi_term', display_name: 'Oshodi Transport Interchange', description: 'Oshodi', lat: 6.5560, lon: 3.3480, category: 'Transport', aliases: ['Terminal 1', 'Terminal 2', 'Terminal 3'] },
  { id: 'tr_cms', display_name: 'CMS Bus Stop', description: 'Marina, Lagos Island', lat: 6.4500, lon: 3.3900, category: 'Transport', aliases: ['Marina'] },
  { id: 'tr_ojota', display_name: 'Ojota Bus Stop', description: 'Ojota', lat: 6.5850, lon: 3.3800, category: 'Transport' },
  { id: 'tr_berger', display_name: 'Berger Bus Stop', description: 'Berger', lat: 6.6450, lon: 3.3700, category: 'Transport' },
  { id: 'tr_ajah', display_name: 'Ajah Roundabout', description: 'Ajah', lat: 6.4667, lon: 3.5667, category: 'Transport', aliases: ['Ajah Bridge'] },

  // Commercial / Malls
  { id: 'com_ikeja_mall', display_name: 'Ikeja City Mall', description: 'Alausa, Ikeja', lat: 6.6136, lon: 3.3578, category: 'Shopping', aliases: ['ICM'] },
  { id: 'com_palms', display_name: 'The Palms Shopping Mall', description: 'Lekki', lat: 6.4339, lon: 3.4456, category: 'Shopping', aliases: ['Shoprite Lekki'] },
  { id: 'com_novare', display_name: 'Novare Lekki Mall', description: 'Sangotedo', lat: 6.4800, lon: 3.6000, category: 'Shopping', aliases: ['Shoprite Sangotedo'] },
  { id: 'com_maryland', display_name: 'Maryland Mall', description: 'Maryland', lat: 6.5700, lon: 3.3680, category: 'Shopping', aliases: ['The Big Black Box'] },
  { id: 'com_tejuosho', display_name: 'Tejuosho Market', description: 'Yaba', lat: 6.5050, lon: 3.3700, category: 'Commercial' },
  { id: 'com_balogun', display_name: 'Balogun Market', description: 'Lagos Island', lat: 6.4560, lon: 3.3880, category: 'Commercial' },
  { id: 'com_computer_village', display_name: 'Computer Village', description: 'Ikeja', lat: 6.5960, lon: 3.3420, category: 'Commercial', aliases: ['Otigba'] },

  // Residential / Districts
  { id: 'res_lekki_1', display_name: 'Lekki Phase 1', description: 'Eti-Osa', lat: 6.4478, lon: 3.4737, category: 'Residential', aliases: ['Phase 1'] },
  { id: 'res_banana', display_name: 'Banana Island', description: 'Ikoyi', lat: 6.4600, lon: 3.4500, category: 'Residential' },
  { id: 'res_magodo', display_name: 'Magodo Phase 2', description: 'Shangisha', lat: 6.6200, lon: 3.3800, category: 'Residential' },
  { id: 'res_vgc', display_name: 'Victoria Garden City', description: 'Lekki-Epe Exp', lat: 6.4700, lon: 3.5400, category: 'Residential', aliases: ['VGC'] },
  { id: 'res_1004', display_name: '1004 Estate', description: 'Victoria Island', lat: 6.4350, lon: 3.4300, category: 'Residential' },
  
  // Hotels & Tourism
  { id: 'hot_eko', display_name: 'Eko Hotels & Suites', description: 'Victoria Island', lat: 6.4267, lon: 3.4301, category: 'Hotel' },
  { id: 'hot_continental', display_name: 'Lagos Continental Hotel', description: 'Victoria Island', lat: 6.4300, lon: 3.4350, category: 'Hotel' },
  { id: 'tour_landmark', display_name: 'Landmark Beach', description: 'Victoria Island', lat: 6.4217, lon: 3.4468, category: 'Tourism' },
  { id: 'tour_nike', display_name: 'Nike Art Gallery', description: 'Lekki', lat: 6.4450, lon: 3.4800, category: 'Tourism' },
  { id: 'tour_conservation', display_name: 'Lekki Conservation Centre', description: 'Lekki', lat: 6.4410, lon: 3.5350, category: 'Tourism', aliases: ['LCC'] },
  { id: 'tour_museum', display_name: 'National Museum Lagos', description: 'Onikan', lat: 6.4460, lon: 3.4030, category: 'Tourism' },
  
  // Education
  { id: 'edu_unilag', display_name: 'University of Lagos', description: 'Akoka, Yaba', lat: 6.5150, lon: 3.3950, category: 'Education', aliases: ['UNILAG'] },
  { id: 'edu_yabatech', display_name: 'Yaba College of Technology', description: 'Yaba', lat: 6.5200, lon: 3.3700, category: 'Education', aliases: ['YABATECH'] },
  { id: 'edu_lasu', display_name: 'Lagos State University', description: 'Ojo', lat: 6.4650, lon: 3.1950, category: 'Education', aliases: ['LASU'] },

  // Landmarks
  { id: 'lm_civic', display_name: 'The Civic Centre', description: 'Victoria Island', lat: 6.4368, lon: 3.4413, category: 'Landmark' },
  { id: 'lm_national_theatre', display_name: 'National Arts Theatre', description: 'Iganmu', lat: 6.4760, lon: 3.3680, category: 'Landmark' },
  { id: 'lm_third_mainland', display_name: 'Third Mainland Bridge', description: 'Lagos Lagoon', lat: 6.5300, lon: 3.4000, category: 'Landmark', aliases: ['3MB'] }
];

export const LocationService = {
  
  search(query: string): LocationData[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return LAGOS_DATABASE.filter(loc => {
      return (
        loc.display_name.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q) ||
        loc.aliases?.some(alias => alias.toLowerCase().includes(q))
      );
    }).slice(0, 10); // Limit results
  },

  reverseGeocode(lat: number, lon: number): LocationData {
    // 1. Check if within Lagos
    if (!this.isInLagos(lat, lon)) {
      throw new Error("Location is outside Lagos State boundaries");
    }

    // 2. Find nearest known location
    let nearest: LocationData | null = null;
    let minDistance = Infinity;

    for (const loc of LAGOS_DATABASE) {
      const dist = this.calculateDistance(lat, lon, loc.lat, loc.lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = loc;
      }
    }

    // 3. If very close to a landmark (< 200m), return that landmark
    if (nearest && minDistance < 0.2) {
      return {
        ...nearest,
        description: `Near ${nearest.display_name}, ${nearest.description}`
      };
    }

    // 4. Otherwise, construct a "Street" address based on the nearest landmark/area
    // In a real app, this would use Google Maps Geocoding API
    // Here we simulate "Street -> Area -> LGA"
    
    return {
      id: `gps_${lat.toFixed(4)}_${lon.toFixed(4)}`,
      display_name: "Pinned Location",
      description: nearest 
        ? `Near ${nearest.display_name}, ${nearest.description}, Lagos` 
        : `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}, Lagos`,
      lat,
      lon,
      category: 'Residential'
    };
  },

  isInLagos(lat: number, lon: number): boolean {
    return (
      lat >= LAGOS_BOUNDS.minLat && 
      lat <= LAGOS_BOUNDS.maxLat && 
      lon >= LAGOS_BOUNDS.minLon && 
      lon <= LAGOS_BOUNDS.maxLon
    );
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  },

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  },

  getCategories() {
    return Array.from(new Set(LAGOS_DATABASE.map(l => l.category))).sort();
  }
};
