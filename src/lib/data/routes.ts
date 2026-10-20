import type { RouteSummary } from "../types";

export const routes: RouteSummary[] = [
  { slug: "acela-express", name: "Acela Express", active: 0, complete: 0, pending: 0, trainNumbers: ["2101", "2102", "2150", "2151", "2160", "2162"] },
  { slug: "adirondack", name: "Adirondack", active: 0, complete: 1, pending: 0, trainNumbers: ["68", "69"] },
  { slug: "amtrak-cascades", name: "Amtrak Cascades", active: 7, complete: 0, pending: 0, trainNumbers: ["500", "502", "503", "504", "505", "506", "507", "508", "509", "511"] },
  { slug: "auto-train", name: "Auto Train", active: 2, complete: 0, pending: 0, trainNumbers: ["52", "53"] },
  { slug: "borealis", name: "Borealis", active: 0, complete: 0, pending: 0, trainNumbers: ["1333", "1340"] },
  { slug: "california-zephyr", name: "California Zephyr", active: 4, complete: 0, pending: 0, trainNumbers: ["5", "6"] },
  { slug: "capitol-corridor", name: "Capitol Corridor", active: 3, complete: 4, pending: 1, trainNumbers: ["520", "521", "528", "529", "536", "544"] },
  { slug: "cardinal", name: "Cardinal", active: 0, complete: 0, pending: 0, trainNumbers: ["50", "51"] },
  { slug: "carolinian-piedmont", name: "Carolinian / Piedmont", active: 0, complete: 2, pending: 0, trainNumbers: ["71", "72", "73", "74", "75", "76"] },
  { slug: "city-of-new-orleans", name: "City of New Orleans", active: 2, complete: 0, pending: 0, trainNumbers: ["58", "59"] },
  { slug: "coast-starlight", name: "Coast Starlight", active: 3, complete: 1, pending: 0, trainNumbers: ["11", "14"] },
  { slug: "crescent", name: "Crescent", active: 0, complete: 2, pending: 1, trainNumbers: ["19", "20"] },
  { slug: "downeaster", name: "Downeaster", active: 1, complete: 0, pending: 0, trainNumbers: ["680", "681", "686", "687"] },
  { slug: "empire-builder", name: "Empire Builder", active: 5, complete: 0, pending: 0, trainNumbers: ["7", "8", "27", "28"] },
  { slug: "empire-service", name: "Empire Service", active: 1, complete: 1, pending: 1, trainNumbers: ["230", "233", "280", "281"] },
  { slug: "ethan-allen-express", name: "Ethan Allen Express", active: 0, complete: 1, pending: 0, trainNumbers: ["290", "291"] },
  { slug: "floridian", name: "Floridian", active: 1, complete: 0, pending: 2, trainNumbers: ["40", "41"] },
  { slug: "gold-runner", name: "Gold Runner", active: 4, complete: 3, pending: 0, trainNumbers: ["701", "702", "710", "711", "714", "715"] },
  { slug: "heartland-flyer", name: "Heartland Flyer", active: 0, complete: 1, pending: 0, trainNumbers: ["821", "822"] },
  { slug: "hiawatha", name: "Hiawatha", active: 0, complete: 2, pending: 0, trainNumbers: ["329", "330", "337", "342"] },
  { slug: "lincoln-illinois", name: "Illinois Service / Lincoln Service", active: 1, complete: 1, pending: 0, trainNumbers: ["301", "302", "305", "307"] },
  { slug: "saluki-illinois", name: "Illinois Service / Saluki", active: 0, complete: 2, pending: 0, trainNumbers: ["390", "391", "392", "393"] },
  { slug: "illinois-zephyr", name: "Illinois Zephyr/Carl Sandburg", active: 0, complete: 2, pending: 0, trainNumbers: ["380", "381", "382", "383"] },
  { slug: "keystone", name: "Keystone", active: 1, complete: 3, pending: 0, trainNumbers: ["600", "642", "643", "650", "651"] },
  { slug: "lake-shore-limited", name: "Lake Shore Limited", active: 2, complete: 0, pending: 0, trainNumbers: ["48", "49", "448", "449"] },
  { slug: "lincoln-missouri", name: "Lincoln Service Missouri River Runner", active: 0, complete: 1, pending: 0, trainNumbers: ["318", "319"] },
  { slug: "maple-leaf", name: "Maple Leaf", active: 0, complete: 1, pending: 0, trainNumbers: ["63", "64"] },
  { slug: "mardi-gras", name: "Mardi Gras Service", active: 0, complete: 2, pending: 0, trainNumbers: ["23", "24", "25", "26"] },
  { slug: "blue-water", name: "Michigan Service / Blue Water", active: 0, complete: 1, pending: 0, trainNumbers: ["364", "365"] },
  { slug: "lincoln-michigan", name: "Michigan Service / Lincoln Service", active: 0, complete: 1, pending: 0, trainNumbers: ["300", "306"] },
  { slug: "pere-marquette", name: "Michigan Service / Pere Marquette", active: 0, complete: 1, pending: 0, trainNumbers: ["370", "371"] },
  { slug: "wolverine", name: "Michigan Service / Wolverine", active: 1, complete: 2, pending: 0, trainNumbers: ["350", "351", "352", "354", "355"] },
  { slug: "missouri-river-runner", name: "Missouri River Runner", active: 0, complete: 1, pending: 0, trainNumbers: ["311", "316"] },
  { slug: "northeast-regional", name: "Northeast Regional", active: 6, complete: 8, pending: 1, trainNumbers: ["66", "67", "93", "94", "125", "160", "171", "186"] },
  { slug: "pacific-surfliner", name: "Pacific Surfliner", active: 8, complete: 2, pending: 1, trainNumbers: ["562", "564", "572", "580", "768", "777", "790", "794"] },
  { slug: "pennsylvanian", name: "Pennsylvanian", active: 0, complete: 0, pending: 0, trainNumbers: ["42", "43"] },
  { slug: "silver-meteor", name: "Silver Meteor", active: 0, complete: 0, pending: 1, trainNumbers: ["97", "98"] },
  { slug: "silver-palmetto", name: "Silver Service / Palmetto", active: 0, complete: 1, pending: 0, trainNumbers: ["89", "90"] },
  { slug: "southwest-chief", name: "Southwest Chief", active: 4, complete: 0, pending: 0, trainNumbers: ["3", "4"] },
  { slug: "sunset-limited", name: "Sunset Limited", active: 2, complete: 0, pending: 0, trainNumbers: ["1", "2"] },
  { slug: "texas-eagle", name: "Texas Eagle", active: 2, complete: 1, pending: 0, trainNumbers: ["21", "22"] },
  { slug: "vermonter", name: "Vermonter", active: 1, complete: 2, pending: 0, trainNumbers: ["54", "55", "56", "57"] },
];

export function systemTotals() {
  return routes.reduce(
    (acc, r) => {
      acc.active += r.active;
      acc.complete += r.complete;
      acc.pending += r.pending;
      return acc;
    },
    { active: 0, complete: 0, pending: 0, routes: routes.length },
  );
}
