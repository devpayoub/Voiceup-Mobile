# mobile (Expo / React Native)

Native client for the citizen complaints platform.

| Function | Why it's needed |
|---|---|
| Same core flow as web (auth, feed, submit, detail, profile) | Service failures (an outage, a transit delay) are usually noticed and reported on a phone, not at a desk — the mobile app is the realistic filing path for most users. |
| Photo picker for evidence | Lets a citizen attach a photo straight from their camera roll when filing, matching how they'd actually document an issue in the moment. |
| Secure on-device token storage | Mobile has no `localStorage`; auth tokens are kept in the OS-level secure store (Keychain/Keystore) instead. |
