# Packaging MarkView for Linux stores

Three artifacts:

| Format | Where | Built by |
|--------|-------|----------|
| `.deb` + `.AppImage` | GitHub Releases, direct download | `npm run tauri build` (local) |
| Snap | Snap Store (`snapcraft.io/markview`) | `snapcraft` reads `snap/snapcraft.yaml` |
| Flatpak | Flathub (`flathub/io.github.scos-lab.MarkView`) | `flatpak-builder` reads `flatpak/io.github.scos-lab.MarkView.yml` |

All three use the same AppStream metadata in
`packaging/io.github.scos-lab.MarkView.metainfo.xml`.

---

## Tagging a release

Everything downstream expects a git tag. Before any of the below:

```bash
# Bump version in package.json, src-tauri/tauri.conf.json, src-tauri/Cargo.toml,
# src/components/AboutModal.tsx, and packaging/*.metainfo.xml <releases>.
git commit -am "Release X.Y.Z"
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin main vX.Y.Z
```

---

## Snap Store

### One-time setup
1. Register an Ubuntu One account at <https://snapcraft.io/account>.
2. Install snapcraft: `sudo snap install snapcraft --classic`.
3. Log in: `snapcraft login`.
4. Reserve the name: `snapcraft register markview` (must be done once, by
   the publisher).

### Each release
```bash
cd markview
snapcraft pack                     # builds .snap in repo root
snapcraft upload *.snap --release=stable
```

Snap Store auto-publishes to `stable` after upload; no human review for
subsequent versions unless the declared `plugs` change substantially.

---

## Flathub

Flathub requires submitting through a pull request to
<https://github.com/flathub/flathub>. Review usually takes 1–2 weeks for
new apps.

### Prerequisites (one-time)
1. Generate offline-build lockfile sources:
   ```bash
   # Install helpers
   pip install flatpak-node-generator
   curl -O https://raw.githubusercontent.com/flatpak/flatpak-builder-tools/master/cargo/flatpak-cargo-generator.py

   # Generate
   python flatpak-cargo-generator.py src-tauri/Cargo.lock -o flatpak/cargo-sources.json
   flatpak-node-generator npm package-lock.json -o flatpak/node-sources.json
   ```
2. Uncomment the `cargo-sources.json` / `node-sources.json` includes in
   `flatpak/io.github.scos-lab.MarkView.yml`.
3. Pin the git source to an exact commit SHA (Flathub reviewer will ask).

### Local test
```bash
flatpak install --user -y flathub org.gnome.Platform//47 org.gnome.Sdk//47 \
    org.freedesktop.Sdk.Extension.rust-stable//24.08 \
    org.freedesktop.Sdk.Extension.node22//24.08

flatpak-builder --user --install --force-clean build-dir \
    flatpak/io.github.scos-lab.MarkView.yml

flatpak run io.github.scos-lab.MarkView
```

### Submit
1. Fork <https://github.com/flathub/flathub>, create branch
   `new-pr/io.github.scos-lab.MarkView`.
2. Add: `io.github.scos-lab.MarkView.yml`,
   `cargo-sources.json`, `node-sources.json`, `io.github.scos-lab.MarkView.metainfo.xml`.
3. Open PR. A reviewer will comment; iterate until merged.
4. Once merged, a dedicated `flathub/io.github.scos-lab.MarkView` repo
   is created — future updates PR into *that* repo, not flathub/flathub.

---

## App ID mapping

- **Tauri identifier** (`tauri.conf.json`): `com.markview.app` — kept for
  backward compatibility with the Microsoft Store binary.
- **Linux distribution ID** (Snap / Flathub / metainfo XML):
  `io.github.scos-lab.MarkView` — Flathub policy requires reverse-DNS
  under a domain the publisher owns; we don't own `markview.app`, so we
  use the `io.github.<org>.<repo>` convention Flathub accepts for
  GitHub-hosted projects.
- Packaging scripts rename the .desktop file and AppStream XML to the
  Linux ID during build so end-users see a single consistent identifier.
