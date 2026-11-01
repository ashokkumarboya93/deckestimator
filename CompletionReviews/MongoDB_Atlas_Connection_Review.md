# MongoDB Atlas Connection Verification & Diagnostics Review

**Project Name:** Deck Estimator  
**Date:** 2026-11-01  
**Category:** Database Infrastructure & Connectivity  
**Status:** ⚠️ Cluster Validated / Blocked by Network Access (IP Whitelist)

---

## 1. Provided Connection Information
- **Raw Input String:** `mongodb+srv://thrisha142003_db_user:<Thrisha1234>@deck-estimator-cluster.3s5imrm.mongodb.net/`
- **Username:** `thrisha142003_db_user`
- **Password:** `Thrisha1234` *(Note: angle brackets `< >` are placeholder delimiters in Atlas templates and are excluded in code)*
- **Cluster Host:** `deck-estimator-cluster.3s5imrm.mongodb.net`

---

## 2. Diagnostics & Connectivity Checks Executed

### A. DNS & SRV Record Resolution
- Executed `Resolve-DnsName -Name "_mongodb._tcp.deck-estimator-cluster.3s5imrm.mongodb.net" -Type SRV`
- **Result:** **PASSED.**  
  The cluster hostname is **valid and actively online**. It resolved to three replica set nodes:
  - `ac-dkdclny-shard-00-00.3s5imrm.mongodb.net:27017`
  - `ac-dkdclny-shard-00-01.3s5imrm.mongodb.net:27017`
  - `ac-dkdclny-shard-00-02.3s5imrm.mongodb.net:27017`

### B. TCP Network Reachability
- Executed `Test-NetConnection -ComputerName ac-dkdclny-shard-00-00.3s5imrm.mongodb.net -Port 27017`
- **Result:** **`TcpTestSucceeded: True`**.  
  Outbound port 27017 is open from this machine.

### C. TLS Handshake & Authentication Gate
- Executed TLS handshake and direct Mongoose connection tests.
- **Latest Check Timestamp:** 2026-11-01 16:52
- **Current Public IP Address:** `205.254.184.136`
- **Result:**
  ```text
  Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist.
  ```

---

## 3. Root Cause: IP Whitelist Configuration in MongoDB Atlas

MongoDB Atlas requires your IP address to be whitelisted in its Network Access settings before any connection or schema inspection can succeed.

- Notice: Your dynamic public IP changed to: **`205.254.184.136`**
- Because dynamic ISP IPs change regularly, **the best and permanent solution** for development is to whitelist **`0.0.0.0/0` (Allow Access from Anywhere)**.

---

## 4. Exact Steps to Enable (in MongoDB Atlas Console)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com/) and open the **deck-estimator-cluster** project.
2. In the left-hand navigation under **SECURITY**, click **Network Access**.
3. Click the green **+ Add IP Address** button.
4. Click **"ALLOW ACCESS FROM ANYWHERE"** (it will auto-fill `0.0.0.0/0`).
5. Click **Confirm**.
6. Wait ~30 seconds for the status badge to turn green and read **Active**.

---

## 5. What Happens Once Whitelisted
As soon as the IP is added:
1. I will configure `backend/.env` with the connection string:
   ```env
   MONGODB_URI=mongodb+srv://thrisha142003_db_user:Thrisha1234@deck-estimator-cluster.3s5imrm.mongodb.net/deck_estimator?retryWrites=true&w=majority
   ```
2. I will inspect the cluster and output:
   - All database names.
   - All collection names.
   - Document counts and all fields/schema keys inside each collection so you can verify them.

