# Tick3ts

Get concert tickets in a *much* better way.


<p align="center">
  <img src="https://github.com/ewynx/tick3ts/blob/main/Tick3ts-slide.png" title="hover text">
</p>

Stop queueing in line for hours or get beaten by bots that buy up all tickets. No more fake tickets. 

## How it works

Sign up with your unique code to win a Tick3t Claim Token (TCT). With this token you'll be able to buy the concert ticket in peace.

Depending on the tier you sign up for, the chance of winning a Tick3t Claim Token are higher or lower and the concert ticket price will vary. In this version we have:
- Standard Tier; 20% chance of getting a TCT & pay standard price
- Top Tier: 50% chance & pay 150% of the concert ticket price

You only pay for the concert ticket when you buy it using your Tick3t Claim Token. 

## This project contains

### Runtime module
First version of the runtime module that does:
- Admin: add unique signup codes, 1 or 35 at a time
- User: register with unique code. Options:
  - Standard tier (25 spots)
  - Top tier (2 spots)
- Admin: draw lucky winners
  - Standard tier (5 winners)
  - Top tier (1 winner)

### Frontend
Frontend demoing the functionality. The current user is both admin (on the artist's team) and user (that wants to buy a ticket).

### Tests
Tests for the Runtime module.

### Run & test

**Prerequisites:**

- Node.js `v18` (we recommend using NVM)
- pnpm `v9.8`
- nvm

Run locally with frontend:

```zsh
nvm use
pnpm install
# starts both UI and sequencer locally
pnpm env:inmemory dev
```

Then go to `localhost:3000`. Make sure to have Auro wallet in the browser!

Run tests:

```zsh
pnpm run test
```
