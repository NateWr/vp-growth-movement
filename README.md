# Growth of a Movement

An interactive platform to explore the actions that have contributed to the Palestinian-led campaign for Boycott, Divestment, and Sanctions (BDS) against Israel.

## Usage

Copy the `.env-example` file to `.env` and add the spreadsheet ID for the Google Sheet dataset.

```
# Spreadsheet where the data is stored
SPREADSHEET_ID="1Abcd_9an...xY34lx"
```

Run the following command to download the data.

```
npm run get-data
```

Run the following command to test on a local dev server.

```
npm run dev -- --host
```

Run the following command to build for production.

```
npm run build
```