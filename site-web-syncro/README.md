# site-web-syncro

Site vitrine de Syncro (syncroia.com) — HTML statique, une page = un fichier.

## Structure

```
index.html                              → /
tarifs.html                             → /tarifs
a-propos.html                           → /a-propos
contact.html                            → /contact
faq.html                                → /faq
site-web.html                           → /site-web
mentions-legales.html                   → /mentions-legales
politique-de-confidentialite.html       → /politique-de-confidentialite
blog/automatisation-ia-pme-2026.html    → /blog/automatisation-ia-pme-2026
404.html                                → page d'erreur
assets/css/style.css                    → styles communs
assets/js/main.js                       → scroll fluide, vidéo, simulateur, FAQ, formulaire
assets/video/                           → VSL + image d'aperçu
vercel.json                             → URLs propres (sans .html) + cache
```

## Tester en local

Les chemins sont absolus (`/assets/...`), il faut donc un petit serveur :

```
npx serve .
```

## Modifier le header ou le footer

Ils sont dupliqués dans chaque page : pense à répercuter la modification partout.
