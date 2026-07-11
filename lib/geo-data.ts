export interface Country {
  code: string;
  name: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
}

export interface City {
  name: string;
  stateCode: string;
  countryCode: string;
}

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "SG", name: "Singapore" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
];

export const STATES: State[] = [
  // India
  { code: "DL", name: "Delhi", countryCode: "IN" },
  { code: "MH", name: "Maharashtra", countryCode: "IN" },
  { code: "KA", name: "Karnataka", countryCode: "IN" },
  { code: "TS", name: "Telangana", countryCode: "IN" },
  { code: "TN", name: "Tamil Nadu", countryCode: "IN" },
  { code: "UP", name: "Uttar Pradesh", countryCode: "IN" },
  { code: "HR", name: "Haryana", countryCode: "IN" },
  { code: "PB", name: "Punjab", countryCode: "IN" },
  { code: "WB", name: "West Bengal", countryCode: "IN" },
  { code: "GJ", name: "Gujarat", countryCode: "IN" },
  // US
  { code: "CA", name: "California", countryCode: "US" },
  { code: "NY", name: "New York", countryCode: "US" },
  { code: "TX", name: "Texas", countryCode: "US" },
  { code: "WA", name: "Washington", countryCode: "US" },
  { code: "MA", name: "Massachusetts", countryCode: "US" },
];

export const CITIES: City[] = [
  // Delhi
  { name: "New Delhi", stateCode: "DL", countryCode: "IN" },
  { name: "Delhi", stateCode: "DL", countryCode: "IN" },
  { name: "Dwarka", stateCode: "DL", countryCode: "IN" },
  // Maharashtra
  { name: "Mumbai", stateCode: "MH", countryCode: "IN" },
  { name: "Pune", stateCode: "MH", countryCode: "IN" },
  { name: "Nagpur", stateCode: "MH", countryCode: "IN" },
  { name: "Thane", stateCode: "MH", countryCode: "IN" },
  { name: "Navi Mumbai", stateCode: "MH", countryCode: "IN" },
  // Karnataka
  { name: "Bangalore", stateCode: "KA", countryCode: "IN" },
  { name: "Mysore", stateCode: "KA", countryCode: "IN" },
  { name: "Mangalore", stateCode: "KA", countryCode: "IN" },
  { name: "Hubli", stateCode: "KA", countryCode: "IN" },
  // Telangana
  { name: "Hyderabad", stateCode: "TS", countryCode: "IN" },
  { name: "Warangal", stateCode: "TS", countryCode: "IN" },
  // Tamil Nadu
  { name: "Chennai", stateCode: "TN", countryCode: "IN" },
  { name: "Coimbatore", stateCode: "TN", countryCode: "IN" },
  { name: "Madurai", stateCode: "TN", countryCode: "IN" },
  // Uttar Pradesh
  { name: "Noida", stateCode: "UP", countryCode: "IN" },
  { name: "Greater Noida", stateCode: "UP", countryCode: "IN" },
  { name: "Lucknow", stateCode: "UP", countryCode: "IN" },
  { name: "Kanpur", stateCode: "UP", countryCode: "IN" },
  { name: "Ghaziabad", stateCode: "UP", countryCode: "IN" },
  // Haryana
  { name: "Gurgaon", stateCode: "HR", countryCode: "IN" },
  { name: "Faridabad", stateCode: "HR", countryCode: "IN" },
  // Punjab
  { name: "Chandigarh", stateCode: "PB", countryCode: "IN" },
  { name: "Ludhiana", stateCode: "PB", countryCode: "IN" },
  { name: "Amritsar", stateCode: "PB", countryCode: "IN" },
  { name: "Jalandhar", stateCode: "PB", countryCode: "IN" },
  // West Bengal
  { name: "Kolkata", stateCode: "WB", countryCode: "IN" },
  { name: "Howrah", stateCode: "WB", countryCode: "IN" },
  // Gujarat
  { name: "Ahmedabad", stateCode: "GJ", countryCode: "IN" },
  { name: "Surat", stateCode: "GJ", countryCode: "IN" },
  { name: "Vadodara", stateCode: "GJ", countryCode: "IN" },

  // US - California
  { name: "San Francisco", stateCode: "CA", countryCode: "US" },
  { name: "Los Angeles", stateCode: "CA", countryCode: "US" },
  { name: "San Jose", stateCode: "CA", countryCode: "US" },
  { name: "San Diego", stateCode: "CA", countryCode: "US" },
  { name: "Berkeley", stateCode: "CA", countryCode: "US" },
  { name: "Palo Alto", stateCode: "CA", countryCode: "US" },
  // US - New York
  { name: "New York City", stateCode: "NY", countryCode: "US" },
  { name: "Buffalo", stateCode: "NY", countryCode: "US" },
  // US - Texas
  { name: "Austin", stateCode: "TX", countryCode: "US" },
  { name: "Houston", stateCode: "TX", countryCode: "US" },
  { name: "Dallas", stateCode: "TX", countryCode: "US" },
  // US - Washington
  { name: "Seattle", stateCode: "WA", countryCode: "US" },
  { name: "Bellevue", stateCode: "WA", countryCode: "US" },
  { name: "Redmond", stateCode: "WA", countryCode: "US" },
  // US - Massachusetts
  { name: "Boston", stateCode: "MA", countryCode: "US" },
  { name: "Cambridge", stateCode: "MA", countryCode: "US" },
];
