const fs = require("fs");

const API_URL = "https://capitaldurable.com/wp-json/wp/v2/posts?per_page=5&_embed=1";

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text = "", max = 140) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatFrenchDate(date = new Date()) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date).replace(/^./, c => c.toUpperCase());
}

function getFeaturedImage(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    || "https://via.placeholder.com/1200x900?text=Capital+Durable";
}

function getPostUrl(post) {
  return post?.link || "#";
}

function getPostTitle(post) {
  return stripHtml(post?.title?.rendered || "Sans titre");
}

function getPostExcerpt(post) {
  return truncate(stripHtml(post?.excerpt?.rendered || ""), 140);
}

function renderMainArticle(post) {
  return `
        <tr>
          <td class="section-gap-top padded">
            <a href="${getPostUrl(post)}">
              <img
                class="img-rounded"
                src="${getFeaturedImage(post)}"
                alt="${escapeHtml(getPostTitle(post))}"
              >
            </a>

            <div class="spacer-12">&nbsp;</div>

            <h3 class="main-title">
              <a href="${getPostUrl(post)}">
                ${escapeHtml(getPostTitle(post))}
              </a>
            </h3>

            <p style="font-size:13px;color:#666;font-weight:300;">
              ${escapeHtml(getPostExcerpt(post))}
            </p>
          </td>
        </tr>
  `;
}

function renderFeaturedColumns(posts) {
  return `
        <tr>
          <td class="section-gap-top padded" style="padding-bottom:12px;">
            <table role="presentation" width="100%" class="two-col" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  ${posts.map(post => `
                    <td class="column">
                      <a href="${getPostUrl(post)}">
                        <img
                          class="img-rounded"
                          src="${getFeaturedImage(post)}"
                          alt="${escapeHtml(getPostTitle(post))}"
                        >
                      </a>
                      <h3>
                        <a href="${getPostUrl(post)}">
                          ${escapeHtml(getPostTitle(post))}
                        </a>
                      </h3>
                      <p style="font-size:13px;color:#666;font-weight:300;">
                        ${escapeHtml(getPostExcerpt(post))}
                      </p>
                    </td>
                  `).join("")}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
  `;
}

function renderStackArticles(posts) {
  return posts.map(post => `
        <tr>
          <td class="padded">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack" style="margin-bottom:24px;">
              <tbody>
                <tr>
                  <td width="30%" style="vertical-align:top;">
                    <a href="${getPostUrl(post)}">
                      <img
                        class="img-rounded-16"
                        src="${getFeaturedImage(post)}"
                        alt="${escapeHtml(getPostTitle(post))}"
                      >
                    </a>
                  </td>
                  <td width="70%" style="vertical-align:top;padding-left:18px;">
                    <h3 style="margin-top:0;font-size:15px;">
                      <a href="${getPostUrl(post)}">
                        ${escapeHtml(getPostTitle(post))}
                      </a>
                    </h3>
                    <p>${escapeHtml(getPostExcerpt(post))}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
  `).join("");
}

function buildNewsletter(posts) {
  const mainPost = posts[0];
  const featuredPosts = posts.slice(1, 3);
  const stackPosts = posts.slice(3, 5);

  return `<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Capital Durable – Newsletter</title>

  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;600;700&display=swap" rel="stylesheet">

  <style>
    body,table,tbody,tr,td{margin:0;padding:0;border:0;border-collapse:collapse;}
    img{display:block;border:0;max-width:100%;height:auto;line-height:100%;}
    body{background:#f5f5f5;font-family:"Montserrat",Arial,sans-serif;color:#333;-webkit-text-size-adjust:100%;}
    a{color:#7FB069;text-decoration:none;}

    h1{
      color:#7FB069;
      font-weight:700;
      margin:0 0 10px 0;
      word-break:break-word;
      line-height:1.3;
      font-family:"Montserrat", Arial, sans-serif;
    }
    h2,h3{
      color:#7FB069;
      font-weight:600;
      margin:0 0 10px 0;
      word-break:break-word;
      line-height:1.3;
      font-family:"Montserrat", Arial, sans-serif;
    }
    p{
      font-size:14px;
      line-height:1.6;
      margin:0 0 14px 0;
      word-break:break-word;
      font-family:"Montserrat", Arial, sans-serif;
      font-weight:300;
      color:#555;
    }

    .wrapper{width:100%!important;background:#f5f5f5;padding:24px 0;}
    .main{
      width:100%!important;
      max-width:600px!important;
      margin:0 auto;
      background:#fff;
      border-collapse:collapse;
      border-radius:20px;
    }

    .padded{padding:20px 24px;}
    .header-bg{background:#FFFFFF;}
    .section-gap-top{padding-top:24px;}
    .label{
      font-size:11px;
      text-transform:uppercase;
      letter-spacing:.5px;
      color:#7FB069;
      margin-bottom:6px;
      font-weight:600;
      font-family:"Montserrat", Arial, sans-serif;
    }

    .img-rounded{border-radius:20px;}
    .img-rounded-16{border-radius:16px;}
    .logo{border-radius:0 !important;}

    .two-col .column{
      width:50%;
      vertical-align:top;
      padding:0 6px 18px;
    }
    .two-col .column h3{margin-top:12px;}

    .spacer-12{line-height:0;font-size:0;height:12px;}

    @media screen and (max-width:600px){
      .two-col .column{display:block!important;width:100%!important;padding:0 0 18px!important;box-sizing:border-box;}
      .stack td{display:block!important;width:100%!important;padding-left:0!important;}
      .padded{padding:16px!important;}
      .wrapper{padding:0!important;}
      .section-gap-top{padding-top:18px!important;}
      h1{font-size:20px!important;}
    }
  </style>
</head>

<body>
  <center class="wrapper">
    <table role="presentation" cellpadding="0" cellspacing="0" class="main" width="100%">
      <tbody>

        <tr>
          <td class="padded header-bg" align="center">
            <img
              src="https://cdn.jsdelivr.net/gh/mas-rgb/sample-static-site@main/logo.png"
              width="220"
              alt="Capital Durable"
              style="display:block;margin:0 auto 18px auto;border:0;"
            >

            <h1>L’actualité de la construction et de la rénovation durable</h1>
            <p style="font-size:13px;color:#666;font-weight:300;">${formatFrenchDate()}</p>
          </td>
        </tr>

        ${mainPost ? renderMainArticle(mainPost) : ""}
        ${featuredPosts.length ? renderFeaturedColumns(featuredPosts) : ""}

        <tr>
          <td class="padded" align="center" style="padding-top:12px;">
            <a href="https://www.helloasso.com/associations/mush/evenements/les-rencontres-de-l-economie-regenerative-occitanie-11-juin-toulouse-2">
              <img
                class="img-rounded"
                src="/images_banner-capitaldurable.png"
                width="560"
                alt="Bannière publicitaire"
                style="max-width:560px;width:100%;"
              >
            </a>
          </td>
        </tr>

        ${stackPosts.length ? renderStackArticles(stackPosts) : ""}

        <tr>
          <td class="padded header-bg" align="center" style="font-size:11px;color:#666;">
            <p style="margin:0;font-weight:300;">© Capital Durable – Tous droits réservés</p>
            <p style="margin:0;font-weight:300;">
              <a href="https://capitaldurable.com/espace-professionnel/" style="color:#7FB069;text-decoration:none;">
                👉 Réservez vos publicités sur Capital Durable
              </a>
            </p>
          </td>
        </tr>

      </tbody>
    </table>
  </center>
</body>
</html>`;
}

async function main() {
  const response = await fetch(API_URL, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  const posts = await response.json();

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error("Aucun article récupéré.");
  }

  const html = buildNewsletter(posts);

  fs.writeFileSync("index.html", html, "utf-8");
  console.log("✅ index.html généré automatiquement avec les derniers articles");
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
