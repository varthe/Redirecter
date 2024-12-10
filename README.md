
# Redirecterr
Filter and redirect Overseerr/Jellyseerr requests based on requester, keywords, age ratings, and more. Supports routing to multiple instances simultaneously.
## Getting Started

### Docker Compose

Use the following `docker-compose.yaml` to deploy the Redirecterr service:

```yaml
services:
  redirecterr:
    image: varthe/redirecterr:latest
    container_name: redirecterr
    hostname: redirecterr
    ports:
      - 8481:8481
    volumes:
      - /path/to/config:/config
      - /path/to/logs:/logs
    environment:
      - LOG_LEVEL=info
```

### Webhook setup

In order for Redirecterr to work you need to disable automatic request approval for your users.

Then, in your seerr navigate to **Settings -> Notifications -> Webhook** and configure the following:

- **Enable Agent**: Enabled
- **Webhook URL**: `http://redirecterr:8481/webhook`
- **JSON Payload**:
  ```json
  {
      "notification_type": "{{notification_type}}",
      "media": {
          "media_type": "{{media_type}}",
          "tmdbId": "{{media_tmdbid}}",
          "tvdbId": "{{media_tvdbid}}",
          "status": "{{media_status}}",
          "status4k": "{{media_status4k}}"
      },
      "request": {
          "request_id": "{{request_id}}",
          "requestedBy_email": "{{requestedBy_email}}",
          "requestedBy_username": "{{requestedBy_username}}",
          "requestedBy_avatar": "{{requestedBy_avatar}}"
      },
      "{{extra}}": []
  }
  ```
- **Notification Types**: Select **Request Pending Approval**

## Configuration Overview

The configuration for Redirecterr is defined in `config.yaml`. Below is a breakdown of the required and optional settings.

### Required Settings

- **`overseerr_url`**: The base URL of your Overseerr instance.
- **`overseerr_api_token`**: The API token for your Overseerr instance.

### Instances

Define your Radarr and Sonarr instances in this section. You can name the instances as needed.

- **`server_id`** (Required): The ID of the instance as shown in **Settings -> Services** in Overseerr. IDs start at 0 and increment sequentially from left to right (see image below).
- **`root_folder`** (Required): The path to the root folder for the instance, as configured in its settings.
- **`quality_profile_id`** (Optional): Overrides the default quality profile set in Overseerr. If not provided, the default profile will be used. To find the profile ID, open your browser and use the following URL, replacing `<url>` with your arr instance's URL and `<api-key>` with its API key:
  ```
  http://<url>/api/v3/qualityProfile?apiKey=<api-key>
  ```
  This returns a JSON response listing all available quality profiles and their IDs. The ID can be found at the very bottom of the response.
- **`approve`** (Optional): Automatically approves requests by default. To disable, set this flag to `False` in the configuration.
  
![arrs](https://github.com/user-attachments/assets/a7a60d91-0f24-42a9-bbe1-ea4f1c945e6a)

### Filters

Define your request filters in this section.

- **`media_type`**: Specifies the type of media, either `"movie"` or `"tv"`.
- **`conditions`**: A set of fields and values used to filter requests. Refer to [testData.js](https://github.com/varthe/Redirecterr/blob/main/testData.js) for examples of request objects. Each field within `conditions` can be:
    - A **single value**: Matches if the value is present in the request.
    - A **list of values**: Matches if any value in the list is present in the request.
    - An **`exclude`** object: Used to exclude specific values. The `exclude`` object can contain either a single value or a list of values. The filter will match if none of the specified values are present in the request.

- **`apply`**: A list of instance names (defined in the **Instances** section) to which the request will be sent.
  
Redirecterr processes filters sequentially and will apply the first matching filter it encounters. Make sure to order your filters appropriately to get the desired behavior.

### Sample `config.yaml`

```yaml
overseerr_url: "https://my-overseerr-instance.com"
overseerr_api_token: "YOUR_API_TOKEN"

instances:
  radarr: # Custom instance name
    server_id: 0
    root_folder: "/mnt/plex/Movies"
  radarr4k: # Custom instance name
    server_id: 1
    root_folder: "/mnt/plex/Movies - 4K"
  radarr_anime: # Custom instance name
    server_id: 2
    root_folder: "/mnt/plex/Movies - Anime"
    quality_profile_id: 2 # Optional
    approve: false
  sonarr: # Custom instance name
    server_id: 0
    root_folder: "/mnt/plex/Shows"

filters:
  - media_type: movie
    conditions:
      keywords: anime # Match if keyword "anime" is present
      requestedBy_username: varthe # Match if requested by "varthe"
      # requestedBy_email: ""
    apply: radarr_anime # Send request to "radarr_anime"
  - media_type: movie
    conditions:
      keywords: # Exclude requests with keywords "anime" or "animation"
        exclude:
          - anime
          - animation
    apply: # Send requests to "radarr" and "radarr4k"
      - radarr
      - radarr4k
  - media_type: tv
    conditions:
      genres: # Match if genre is "adventure" or "comedy"
        - adventure
        - comedy
      contentRatings: # Match if content rating is "12" or "16"
        - 12
        - 16
    apply: sonarr # Send request to "sonarr"
```
