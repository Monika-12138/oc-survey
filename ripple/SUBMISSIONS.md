# Response destination

This GitHub Pages survey is entirely contained in `Monika-12138/oc-survey`.
It does not call or modify `yorhagengyue/ripple-core`.

GitHub Pages serves static files and cannot privately store survey responses by
itself. Before merging, choose a response service owned by the personal account
(for example, Formspree or a Google Apps Script connected to a private Sheet),
then place its HTTPS submission URL in this tag in `index.html`:

```html
<meta name="survey-endpoint" content="https://your-personal-form-endpoint.example">
```

Until a URL is configured, the normal survey shows a clear “not accepting
responses yet” message. `?preview` remains fully functional and never sends
data anywhere.

Do not use GitHub Issues, repository files, or a client-side GitHub token to
collect email addresses or phone numbers.
