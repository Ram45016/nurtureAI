
export const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return { 
      display: `${months} month${months !== 1 ? 's' : ''}`, 
      totalMonths: months, 
      years: 0,
      decimal: months / 12
    };
  }
  
  const decimalAge = years + (months / 12);
  return { 
    display: `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`, 
    totalMonths: (years * 12) + months,
    years: years,
    decimal: decimalAge
  };
};

export const getExpectedWeightRange = (ageInYears: number, gender: string) => {
  // WHO Weight-for-age simplified (average ranges)
  if (ageInYears < 0.5) return { min: 3.2, max: 7.5 };
  if (ageInYears < 1) return { min: 7.5, max: 10.5 };
  if (ageInYears < 2) return { min: 10, max: 13.5 };
  if (ageInYears < 4) return { min: 13, max: 18 };
  if (ageInYears < 6) return { min: 17, max: 23 };
  if (ageInYears < 8) return { min: 21, max: 30 };
  return { min: 28, max: 42 };
};

export const getExpectedHeightRange = (ageInYears: number, gender: string) => {
  // WHO Height-for-age simplified (average ranges)
  if (ageInYears < 0.5) return { min: 48, max: 66 };
  if (ageInYears < 1) return { min: 66, max: 76 };
  if (ageInYears < 2) return { min: 80, max: 92 };
  if (ageInYears < 4) return { min: 95, max: 105 };
  if (ageInYears < 6) return { min: 106, max: 118 };
  if (ageInYears < 8) return { min: 116, max: 130 };
  return { min: 130, max: 150 };
};

export const getHydrationGoal = (ageInYears: number) => {
  if (ageInYears < 0.5) return 700;
  if (ageInYears < 1) return 800;
  if (ageInYears < 3) return 1300;
  if (ageInYears < 8) return 1700;
  return 2100;
};

export const getRecommendedMealFrequency = (ageInYears: number) => {
  if (ageInYears < 0.5) return 8; // Milk feeds
  if (ageInYears < 1) return 5; // Milk + Solids
  if (ageInYears < 3) return 5; // 3 meals + 2 snacks
  return 4; // 3 meals + 1 snack
};

export const getNextVaccineRecommendation = (ageInMonths: number) => {
  if (ageInMonths < 2) return { name: "Hepatitis B (2nd dose), DTaP, Hib, IPV, PCV13, Rotavirus", monthsRemaining: 2 - ageInMonths };
  if (ageInMonths < 4) return { name: "DTaP, Hib, IPV, PCV13, Rotavirus (2nd dose)", monthsRemaining: 4 - ageInMonths };
  if (ageInMonths < 6) return { name: "DTaP, Hib, IPV, PCV13, Rotavirus, Flu", monthsRemaining: 6 - ageInMonths };
  if (ageInMonths < 12) return { name: "MMR, Chickenpox (Varicella), HepA", monthsRemaining: 12 - ageInMonths };
  if (ageInMonths < 18) return { name: "DTaP, Hib, PCV13 boosters", monthsRemaining: 18 - ageInMonths };
  if (ageInMonths < 48) return { name: "DTaP, IPV, MMR, Varicella boosters", monthsRemaining: 48 - ageInMonths };
  return { name: "Annual Flu Shot & Regular Checkups", monthsRemaining: 0 };
};
