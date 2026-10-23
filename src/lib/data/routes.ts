import type { RouteSummary } from "../types";

export const routes: RouteSummary[] = [
  { slug: "acela-express", name: "Acela Express", active: 0, complete: 0, pending: 0, trainNumbers: ["2101","2102","2103","2104","2105","2106","2108","2109","2112","2113","2114","2115","2116","2118","2119","2120","2122","2123","2124","2126","2127","2128","2133","2148","2149","2150","2151","2152","2154","2155","2156","2158","2159","2160","2162","2163","2165","2167","2171","2190","2193","2201","2203","2205","2207","2208","2209","2211","2212","2213","2215","2216","2218","2219","2220","2222","2224","2226","2227","2228","2233","2248","2249","2250","2251","2252","2254","2255","2256","2258","2259","2260","2262","2263","2264","2265","2267","2271","2290","2293"] },
  { slug: "adirondack", name: "Adirondack", active: 0, complete: 1, pending: 0, trainNumbers: ["68","69"] },
  { slug: "amtrak-cascades", name: "Amtrak Cascades", active: 7, complete: 0, pending: 0, trainNumbers: ["500","502","503","504","505","506","507","508","509","511","516","517","518","519","964","967","968"] },
  { slug: "auto-train", name: "Auto Train", active: 2, complete: 0, pending: 0, trainNumbers: ["52","53"] },
  { slug: "berkshire-flyer", name: "Berkshire Flyer", active: 0, complete: 0, pending: 0, trainNumbers: ["1233","1246"] },
  { slug: "borealis", name: "Borealis", active: 0, complete: 0, pending: 0, trainNumbers: ["1333","1340"] },
  { slug: "california-zephyr", name: "California Zephyr", active: 4, complete: 0, pending: 0, trainNumbers: ["5","6"] },
  { slug: "capitol-corridor", name: "Capitol Corridor", active: 3, complete: 4, pending: 1, trainNumbers: ["520","521","522","523","524","525","526","527","528","529","530","531","532","534","535","536","537","538","539","540","541","542","543","544","545","547","548","549","550","551","552","720","723","724","727","728","729","732","733","734","736","737","738","741","742","743","744","745","746","747","748","749","751"] },
  { slug: "cardinal", name: "Cardinal", active: 0, complete: 0, pending: 0, trainNumbers: ["50","51"] },
  { slug: "carolinian-piedmont", name: "Carolinian / Piedmont", active: 0, complete: 2, pending: 0, trainNumbers: ["71","72","73","74","75","76","77","78","79","80","105","123","1179","1180"] },
  { slug: "city-of-new-orleans", name: "City of New Orleans", active: 2, complete: 0, pending: 0, trainNumbers: ["58","59"] },
  { slug: "coast-starlight", name: "Coast Starlight", active: 3, complete: 1, pending: 0, trainNumbers: ["11","14"] },
  { slug: "crescent", name: "Crescent", active: 0, complete: 2, pending: 1, trainNumbers: ["19","20","1471","1479","1495"] },
  { slug: "downeaster", name: "Downeaster", active: 1, complete: 0, pending: 0, trainNumbers: ["680","681","682","683","684","685","686","687","688","689","690","691","692","693","694","695","696","697","698","699","1689","1697"] },
  { slug: "empire-builder", name: "Empire Builder", active: 5, complete: 0, pending: 0, trainNumbers: ["7","8","27","28"] },
  { slug: "empire-service", name: "Empire Service", active: 1, complete: 1, pending: 1, trainNumbers: ["230","232","233","234","235","236","237","238","239","240","241","243","244","245","280","281","283","284"] },
  { slug: "ethan-allen-express", name: "Ethan Allen Express", active: 0, complete: 1, pending: 0, trainNumbers: ["290","291"] },
  { slug: "floridian", name: "Floridian", active: 1, complete: 0, pending: 2, trainNumbers: ["40","41"] },
  { slug: "gold-runner", name: "Gold Runner", active: 4, complete: 3, pending: 0, trainNumbers: ["701","702","703","704","710","711","712","713","714","715","716","717","718","719"] },
  { slug: "heartland-flyer", name: "Heartland Flyer", active: 0, complete: 1, pending: 0, trainNumbers: ["821","822"] },
  { slug: "hiawatha", name: "Hiawatha", active: 0, complete: 2, pending: 0, trainNumbers: ["329","330","331","332","334","335","336","337","338","339","341","342","343"] },
  { slug: "lincoln-illinois", name: "Illinois Service / Lincoln Service", active: 1, complete: 1, pending: 0, trainNumbers: ["301","302","305","307"] },
  { slug: "saluki-illinois", name: "Illinois Service / Saluki", active: 0, complete: 2, pending: 0, trainNumbers: ["390","391","392","393"] },
  { slug: "illinois-zephyr", name: "Illinois Zephyr/Carl Sandburg", active: 0, complete: 2, pending: 0, trainNumbers: ["380","381","382","383"] },
  { slug: "keystone", name: "Keystone", active: 1, complete: 3, pending: 0, trainNumbers: ["110","600","601","605","607","609","611","612","615","622","624","626","637","639","640","641","642","643","644","645","646","647","648","649","650","651","652","653","654","655","656","657","658","660","661","662","663","664","665","666","667","669","670","671","672","674","887"] },
  { slug: "lake-shore-limited", name: "Lake Shore Limited", active: 2, complete: 0, pending: 0, trainNumbers: ["48","49","448","449"] },
  { slug: "lincoln-missouri", name: "Lincoln Service Missouri River Runner", active: 0, complete: 1, pending: 0, trainNumbers: ["318","319"] },
  { slug: "maple-leaf", name: "Maple Leaf", active: 0, complete: 1, pending: 0, trainNumbers: ["63","64"] },
  { slug: "mardi-gras", name: "Mardi Gras Service", active: 0, complete: 2, pending: 0, trainNumbers: ["23","24","25","26"] },
  { slug: "blue-water", name: "Michigan Service / Blue Water", active: 0, complete: 1, pending: 0, trainNumbers: ["364","365"] },
  { slug: "lincoln-michigan", name: "Michigan Service / Lincoln Service", active: 0, complete: 1, pending: 0, trainNumbers: ["300","306"] },
  { slug: "pere-marquette", name: "Michigan Service / Pere Marquette", active: 0, complete: 1, pending: 0, trainNumbers: ["370","371"] },
  { slug: "wolverine", name: "Michigan Service / Wolverine", active: 1, complete: 2, pending: 0, trainNumbers: ["350","351","352","353","354","355"] },
  { slug: "missouri-river-runner", name: "Missouri River Runner", active: 0, complete: 1, pending: 0, trainNumbers: ["311","316"] },
  { slug: "northeast-regional", name: "Northeast Regional", active: 6, complete: 8, pending: 1, trainNumbers: ["65","66","67","82","84","85","86","87","88","93","94","95","96","99","100","101","103","104","106","109","111","112","113","117","118","119","120","121","122","124","125","126","127","129","130","131","132","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149","150","151","152","153","154","155","156","157","158","159","160","161","162","163","164","165","166","167","168","169","170","171","172","173","174","175","176","177","178","179","181","182","183","184","185","186","189","190","192","193","194","195","196","197","198","400","405","409","416","417","425","426","450","460","461","463","464","465","467","470","471","473","474","475","478","479","486","488","494","495","497","499","844","845","1071","1078","1079","1080","1082","1087","1088","1089","1090","1094","1095","1097","1098","1099","1103","1109","1111","1116","1118","1124","1126","1127","1129","1135","1138","1140","1142","1143","1144","1146","1147","1150","1151","1152","1153","1154","1155","1156","1160","1161","1162","1163","1164","1165","1167","1168","1169","1194","1195","2107","2131","2223"] },
  { slug: "pacific-surfliner", name: "Pacific Surfliner", active: 8, complete: 2, pending: 1, trainNumbers: ["562","564","566","567","572","573","579","580","581","584","587","588","591","593","595","757","761","765","769","770","774","777","782","785","786","790","794","1561","1565","1569","1570","1574","1577","1582","1585","1590","1594"] },
  { slug: "pennsylvanian", name: "Pennsylvanian", active: 0, complete: 0, pending: 0, trainNumbers: ["42","43"] },
  { slug: "silver-meteor", name: "Silver Meteor", active: 0, complete: 0, pending: 1, trainNumbers: ["97","98","1041"] },
  { slug: "silver-palmetto", name: "Silver Service / Palmetto", active: 0, complete: 1, pending: 0, trainNumbers: ["89","90","1040"] },
  { slug: "southwest-chief", name: "Southwest Chief", active: 4, complete: 0, pending: 0, trainNumbers: ["3","4"] },
  { slug: "sunset-limited", name: "Sunset Limited", active: 2, complete: 0, pending: 0, trainNumbers: ["1","2"] },
  { slug: "texas-eagle", name: "Texas Eagle", active: 2, complete: 1, pending: 0, trainNumbers: ["21","22"] },
  { slug: "vermonter", name: "Vermonter", active: 1, complete: 2, pending: 0, trainNumbers: ["54","55","56","57","107","128","1107","1128"] },
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
