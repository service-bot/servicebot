# PayTheFly Plugin for ServiceBot

Enables cryptocurrency payments via [PayTheFly](https://pro.paythefly.com) on BSC and TRON networks.

## Configuration

Set the following environment variables:

```bash
PAYTHEFLY_PROJECT_ID=your-project-id
PAYTHEFLY_PROJECT_KEY=your-project-key       # For webhook HMAC-SHA256 verification
PAYTHEFLY_CHAIN_ID=56                         # 56=BSC, 728126428=TRON
PAYTHEFLY_TOKEN_ADDRESS=0x...                 # Payment token contract address
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/paythefly/webhook` | POST | Receives payment confirmations from PayTheFly |
| `/paythefly/create` | POST | Creates a new payment order |
| `/paythefly/status` | GET | Checks order status |

## Webhook Security

- HMAC-SHA256 signature verification: `HMAC-SHA256(data + "." + timestamp, projectKey)`
- Timing-safe comparison via `crypto.timingSafeEqual`
- Stale webhook rejection (>5 minutes)

## PayTheFly API Spec

- **EIP-712 Domain**: `{ name: "PayTheFlyPro", version: "1" }`
- **Amount**: Human-readable (e.g., "0.01"), NOT raw units
- **Webhook payload**: `value`, `confirmed`, `serial_no`, `tx_hash`, `wallet`, `tx_type`
- **tx_type**: 1=payment, 2=withdrawal
- **Chains**: BSC (chainId=56, 18 decimals), TRON (chainId=728126428, 6 decimals)
