export const agentColors: Record<string, string> = {
  main: '#3b82f6',    // Rick - blue
  popeye: '#22c55e',  // Cleopatra - green  
  nico: '#f59e0b',    // El Father - amber
  together: '#a855f7', // Dr. Ashley - purple
  tesla: '#06b6d4',   // Tesla - cyan
};

export const agentInitials: Record<string, string> = {
  main: 'R',
  popeye: 'C',
  nico: 'E',
  together: 'A',
  tesla: 'T',
};

export const agentNames: Record<string, string> = {
  main: 'Rick Sanchez',
  popeye: 'Cleopatra',
  nico: 'El Father',
  together: 'Dr. Ashley',
  tesla: 'Tesla',
};

// Helper function to get agent color by name
export function getAgentColor(agentName: string): string {
  const normalized = agentName.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('rick')) return agentColors.main;
  if (normalized.includes('cleopatra')) return agentColors.popeye;
  if (normalized.includes('father')) return agentColors.nico;
  if (normalized.includes('ashley')) return agentColors.together;
  if (normalized.includes('tesla')) return agentColors.tesla;
  return '#6b7280'; // default gray
}

// Helper function to get agent initial by name
export function getAgentInitial(agentName: string): string {
  const normalized = agentName.toLowerCase().replace(/\s+/g, '');
  if (normalized.includes('rick')) return agentInitials.main;
  if (normalized.includes('cleopatra')) return agentInitials.popeye;
  if (normalized.includes('father')) return agentInitials.nico;
  if (normalized.includes('ashley')) return agentInitials.together;
  if (normalized.includes('tesla')) return agentInitials.tesla;
  return agentName.charAt(0).toUpperCase();
}
