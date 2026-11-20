
const IPLOGS_URL = "https://iplogs.com/v1/check";
const PUBLIC_IP_URL = "https://api.ipify.org?format=json";

export async function getPublicIp() {
  const response = await fetch(PUBLIC_IP_URL);

  if (!response.ok) {
    throw new Error(`Public IP lookup failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.ip) {
    throw new Error("Public IP was not returned.");
  }

  return String(data.ip).trim();
}

export async function checkIpReputation(ip) {
  if (!ip) {
    throw new Error("Public IP is required for network verification.");
  }

  const response = await fetch(IPLOGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ip })
  });

  if (!response.ok) {
    throw new Error(`IPLogs request failed: ${response.status}`);
  }

  const data = await response.json();

  const ipInfo = data.ip_info || {};
  const signals = Array.isArray(data.signals)
    ? data.signals
    : [];

  const matchedSignals = signals.filter(
    signal => signal?.matched === true
  );

  const vpnDetected =
    data.is_vpn === true ||
    ipInfo.is_vpn === true;

  const proxyDetected =
    data.is_proxy === true ||
    ipInfo.is_proxy === true;

  const proxyType = String(
    data.proxy_type ||
    ipInfo.proxy_type ||
    ""
  ).toLowerCase();

  const residentialProxyDetected =
    proxyDetected && proxyType === "residential";

  const publicProxyDetected =
    proxyDetected &&
    ["public", "datacenter", "hosting"].includes(proxyType);

  const torDetected = data.is_tor === true;
  const relayDetected = data.is_relay === true;

  const hostingDetected = data.is_hosting === true;

  const suspiciousActivityDetected =
    data.reputation === "blocklist" ||
    matchedSignals.some(
      signal => signal.type === "threat_intel_listed"
    );

  return {
    provider: "IPLogs",
    checked: true,
    ip,
    verdict: data.verdict || "unknown",
    score: data.score ?? null,
    confidence: data.confidence ?? null,
    mode: data.mode || "full",
    countryCode: ipInfo.country_code || "",
    country: ipInfo.country || "",
    city: ipInfo.city || "",
    isp: ipInfo.isp || ipInfo.org || "",
    vpnProvider: ipInfo.vpn_provider || data.vpn_provider || "",
    vpnDetected,
    proxyDetected,
    proxyType,
    residentialProxyDetected,
    publicProxyDetected,
    suspiciousActivityDetected,
    reputation: data.reputation || "unknown",
    threatIntelListed: matchedSignals.some(
      signal => signal.type === "threat_intel_listed"
    ),
    hostingDetected,
    torDetected,
    relayDetected,
    signals,
    raw: data
  };
}

export const checkNetwork = checkIpReputation;
