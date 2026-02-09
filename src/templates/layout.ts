export function wrapInLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    body {
      background: #f8fafc;
      color: #171717;
      font-family: "Plus Jakarta Sans", sans-serif;
      min-height: 100vh;
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}
