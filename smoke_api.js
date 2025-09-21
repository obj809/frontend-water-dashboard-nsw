// smoke_api.js

const BASE = "http://localhost:5174/api";

async function getJson(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  const ct = res.headers.get("content-type") || "";
  let body;
  if (ct.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { url, status: res.status, ok: res.ok, body };
}

function logHeader(title) {
  console.log(`\n=== ${title} ===`);
}

function logResult({ url, status, ok, body }, previewKeys = []) {
  console.log(`${ok ? "✅" : "❌"} [${status}] ${url}`);
  if (!ok) {
    console.log("   ", body);
    return;
  }
  if (Array.isArray(body)) {
    console.log("   count:", body.length);
    if (body.length && previewKeys.length) {
      const sample = {};
      for (const k of previewKeys) sample[k] = body[0][k];
      console.log("   sample:", sample);
    }
  } else if (typeof body === "object" && body !== null) {
    if (previewKeys.length) {
      const sample = {};
      for (const k of previewKeys) sample[k] = body[k];
      console.log("   fields:", sample);
    } else {
      console.log("   keys:", Object.keys(body));
    }
  } else {
    console.log("   body:", body);
  }
}

async function main() {
  try {
    logHeader("Welcome");
    logResult(await getJson("/"), ["message"]);

    logHeader("Dams - List");
    const damsList = await getJson("/dams/");
    logResult(damsList, ["dam_id", "dam_name"]);
    const damId = Array.isArray(damsList.body) && damsList.body[0]?.dam_id;

    logHeader("Dams - Detail");
    if (damId) {
      logResult(await getJson(`/dams/${damId}`), ["dam_id", "dam_name"]);
    } else {
      console.log("   ⚠️ No dams returned; skipping dam detail.");
    }

    logHeader("Latest Data - List");
    const latestList = await getJson("/latest_data/");
    logResult(latestList, ["dam_id", "date"]);
    const latestDamId = Array.isArray(latestList.body) && latestList.body[0]?.dam_id;

    logHeader("Latest Data - Detail");
    if (latestDamId) {
      logResult(await getJson(`/latest_data/${latestDamId}`), ["dam_id", "date"]);
    } else {
      console.log("   ⚠️ No latest data rows; skipping detail.");
    }

    logHeader("Dam Resources - List");
    const resourcesList = await getJson("/dam_resources/");
    logResult(resourcesList, ["resource_id", "dam_id", "date"]);
    const resourceId =
      Array.isArray(resourcesList.body) && resourcesList.body[0]?.resource_id;

    logHeader("Dam Resources - Detail");
    if (resourceId != null) {
      logResult(await getJson(`/dam_resources/${resourceId}`), [
        "resource_id",
        "dam_id",
        "date",
      ]);
    } else {
      console.log("   ⚠️ No dam resources; skipping detail.");
    }

    logHeader("Specific Dam Analysis - List (All)");
    const sdaAll = await getJson("/specific_dam_analysis/");
    logResult(sdaAll, ["dam_id", "analysis_date"]);

    logHeader("Specific Dam Analysis - By Dam");
    let sdaDamId = damId;
    if (!sdaDamId && Array.isArray(sdaAll.body) && sdaAll.body[0]?.dam_id) {
      sdaDamId = sdaAll.body[0].dam_id;
    }
    if (sdaDamId) {
      const sdaByDam = await getJson(`/specific_dam_analysis/${sdaDamId}`);
      logResult(sdaByDam, ["dam_id", "analysis_date"]);

      const firstDate =
        Array.isArray(sdaByDam.body) && sdaByDam.body[0]?.analysis_date;
      logHeader("Specific Dam Analysis - Dam + Date");
      if (firstDate) {
        logResult(
          await getJson(`/specific_dam_analysis/${sdaDamId}/${firstDate}`),
          ["dam_id", "analysis_date"]
        );
      } else {
        console.log("   ⚠️ No analysis dates for dam; skipping composite endpoint.");
      }
    } else {
      console.log("   ⚠️ No dam_id available for SDA by-dam tests.");
    }

    logHeader("Dam Groups - List");
    const groupsList = await getJson("/dam_groups/");
    logResult(groupsList, ["group_name"]);
    const groupName =
      Array.isArray(groupsList.body) && groupsList.body[0]?.group_name;

    logHeader("Dam Groups - Detail");
    if (groupName) {
      logResult(await getJson(`/dam_groups/${encodeURIComponent(groupName)}`), [
        "group_name",
      ]);
    } else {
      console.log("   ⚠️ No groups; skipping group detail.");
    }

    logHeader("Dam Group Members - List");
    const membersList = await getJson("/dam_group_members/");
    logResult(membersList, ["group_name", "dam_id"]);

    logHeader("Dam Group Members - By Group");
    if (groupName) {
      logResult(
        await getJson(`/dam_group_members/${encodeURIComponent(groupName)}`),
        ["group_name", "dam_id"]
      );
    } else {
      console.log("   ⚠️ No group_name to query members by group.");
    }

    logHeader("Overall Dam Analysis - List");
    const overallList = await getJson("/overall_dam_analysis/");
    logResult(overallList, ["analysis_date"]);
    const anyOverallDate =
      Array.isArray(overallList.body) && overallList.body[0]?.analysis_date;

    logHeader("Overall Dam Analysis - Detail (by date)");
    if (anyOverallDate) {
      logResult(
        await getJson(`/overall_dam_analysis/${anyOverallDate}`),
        ["analysis_date"]
      );
    } else {
      console.log("   ⚠️ No overall analysis dates; skipping date detail.");
    }

    console.log("\n✅ Smoke test complete.");
  } catch (err) {
    console.error("\n💥 Smoke test crashed:", err);
    process.exitCode = 1;
  }
}

main();
