export function isValidUniversityEmail(email) {
  const allowedDomains = [
    "my.sliit.lk",
    "sliit.lk",
    "nsbm.ac.lk",
    "ucsc.cmb.ac.lk",
    "kln.ac.lk",
    "mrt.ac.lk"
  ];

  const domain = email.split("@")[1];
  return allowedDomains.includes(domain);
}

export function isFutureDate(dateValue) {
  return new Date(dateValue).getTime() > Date.now();
}
