export const years = [1999, 2002, 2006, 2010, 2014, 2019, 2024]

export const attributes = { // Reordered so that similar topics are close
  family: 'Political faction',
  lrgen: 'Left/right',
  lrecon: 'Economic left/right',
  spendvtax: 'Spending vs. reducing taxes',
  redistribution: 'Wealth redistribution',
  deregulation: 'Market deregulation',
  eu_position: 'European Union',
  eu_intmark: 'EU internal market',
  eu_foreign: 'EU foreign policy',
  immigrate_policy: 'Immigration policies',
  multiculturalism: 'Multiculturalism',
  ethnic_minorities: 'Ethnic minorities',
  nationalism: 'Nationalism',
  civlib_laworder: 'Civil liberties vs. law & order',
  sociallifestyle: 'Social lifestyle',
  religious_principles: 'Religious principles',
  environment: 'Environment',
  // urban_rural: 'Urban vs. rural',
  regions: 'Regionalism'
}
export const dropDownAttributes = {
  vote: 'Votes in the most recent national election (%)',
  seat: 'Parliament seats in the most recent national election (%)',
  epvote: 'Votes in the most recent European election (%)',
  lrgen: 'Left/right',
  lrecon: 'Economic left/right',
  spendvtax: 'Spending vs. reducing taxes',
  redistribution: 'Wealth redistribution',
  deregulation: 'Market deregulation',
  eu_position: 'European Union',
  eu_intmark: 'EU internal market',
  eu_foreign: 'EU foreign policy',
  immigrate_policy: 'Immigration policies',
  multiculturalism: 'Multiculturalism',
  ethnic_minorities: 'Ethnic minorities',
  nationalism: 'Nationalism',
  civlib_laworder: 'Civil liberties vs. law & order',
  sociallifestyle: 'Social lifestyle',
  religious_principles: 'Religious principles',
  environment: 'Environment',
  // urban_rural: 'Urban vs. rural',
  regions: 'Regionalism'
}
export const attributesExplanations = {
  family: 'Parties\' political<br>faction in ',
  lrgen: 'Overall ideological stance<br>0 = extreme left<br>5 = center<br>10 = extreme right',
  lrecon: 'Ideological stance on economic issues<br>0 = extreme left<br>5 = center<br>10 = extreme right',
  spendvtax: 'Improving public services vs. reducing taxes<br>0 = strongly favors improving public services<br>10 = strongly favors reducing taxes',
  redistribution: 'Redistribution of wealth from the rich to the poor<br>0 = strongly favors redistribution<br>10 = strongly opposes redistribution',
  deregulation: 'Deregulations of markets<br>0 = strongly opposes deregulation<br>10 = strongly favors deregulation',
  eu_position: 'European integration<br>1 = strongly opposed<br>2 = opposed<br>3 = somewhat opposed<br>4 = neutral<br>' +
    '5 = somewhat in favor<br>6 = in favor<br>7 = strongly in favor',
  eu_intmark: 'Internal market (free movement of goods, services, etc.)<br>1 = strongly opposed<br>2 = opposed<br>3 = somewhat opposed<br>4 = neutral<br>' +
    '5 = somewhat in favor<br>6 = in favor<br>7 = strongly in favor',
  eu_foreign: 'EU foreign and security policy<br>1 = strongly opposed<br>2 = opposed<br>3 = somewhat opposed<br>4 = neutral<br>' +
    '5 = somewhat in favor<br>6 = in favor<br>7 = strongly in favor',
  immigrate_policy: 'Immigration policies<br>0 = strongly favors liberal policies<br>10 = strongly favors restrictive policies',
  multiculturalism: 'Integration of immigrants and asylum seekers<br>0 = strongly favors multiculturalism<br>10 = strongly favors assimilation',
  ethnic_minorities: 'Rights for ethnic minorities<br>0 = strongly favors more rights<br>10 = strongly opposes more rights',
  nationalism: 'Cosmopolitanism vs. nationalism<br>0 = Strongly favors a cosmopolitan society<br>10 = Strongly favors a nationalist society',
  civlib_laworder: 'Civil liberties vs. law & order<br>0 = strongly favors civil liberties<br>10 = strongly favors tough measures to fight crime',
  sociallifestyle: 'LGBT rights, gender equality, etc.<br>0 = strongly favors liberal policies<br>10 = strongly opposes liberal policies',
  religious_principles: 'Role of religious principles in politics<br>0 = strongly opposes religion in politics<br>10 = strongly favors religion in politics',
  environment: 'Environmental sustainability<br>0 = strongly favors environment protection at the cost of economic growth<br>' +
    '10 = strongly favors economic growth at the cost of environment protection',
  // urban_rural: 'Urban vs. rural interests<br>0 = strongly supports urban interests<br>10 = strongly supports rural interests',
  regions: 'Political decentralization to regions/localities<br>0 = strongly favors political decentralization<br>10 = strongly opposes political decentralization'
}

export const attributesToExclude = {
  1999: ['spendvtax', 'redistribution', 'deregulation', 'eu_intmark', 'immigrate_policy', 'multiculturalism', 'ethnic_minorities', 'nationalism',
    'civlib_laworder', 'sociallifestyle', 'religious_principles', 'environment', 'regions'],
  2002: ['spendvtax', 'redistribution', 'deregulation', 'immigrate_policy', 'multiculturalism', 'ethnic_minorities', 'nationalism',
    'civlib_laworder', 'sociallifestyle', 'religious_principles', 'environment', 'regions'],
  2006: ['nationalism', 'environment'],
  2010: ['nationalism'],
  2014: [],
  2019: [],
  2024: []
}

export const factions = {
  1: 'Radical Right',
  2: 'Conservatives',
  3: 'Liberal',
  4: 'Christian-Democratic',
  5: 'Socialist',
  6: 'Radical Left',
  7: 'Green',
  8: 'Regionalist',
  9: 'No faction',
  10: 'Confessional',
  11: 'Agrarian/Center'
}

export const countries = {
  1: 'Belgium',
  2: 'Denmark',
  3: 'Germany',
  4: 'Greece',
  5: 'Spain',
  6: 'France',
  7: 'Ireland',
  8: 'Italy',
  10: 'Netherlands',
  11: 'UK',
  12: 'Portgual',
  13: 'Austria',
  14: 'Finland',
  16: 'Sweden',
  20: 'Bulgaria',
  21: 'Czechia',
  22: 'Estonia',
  23: 'Hungary',
  24: 'Latvia',
  25: 'Lithuania',
  26: 'Poland',
  27: 'Romania',
  28: 'Slovakia',
  29: 'Slovenia',
  31: 'Croatia',
  // 34: 'Türkiye',
  // 35: 'Norway',
  // 36: 'Switzerland',
  // 37: 'Malta',
  // 38: 'Luxembourg',
  40: 'Cyprus'
  // 45: 'Iceland'
}

export function moveTooltip (event, tooltip) {
  // Tooltip dimensions (node gives the DOM element from the d3 selection)
  const width = tooltip.node().offsetWidth
  const height = tooltip.node().offsetHeight

  // event.pageX/Y give cursor position
  let x = event.pageX + 10
  let y = event.pageY + 10

  // Tooltip too much on the right
  if (x + width > window.innerWidth) {
    x = event.pageX - width // Move it to the left
  }

  // Tooltip too much on the bottom
  if (y + height > window.innerHeight) {
    y = event.pageY - height + 5 // Move it up
  }

  tooltip.style('left', `${x}px`).style('top', `${y}px`)
}
