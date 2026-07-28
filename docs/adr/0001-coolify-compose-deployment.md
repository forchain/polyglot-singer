# Coolify Compose Deployment

Status: accepted

Deploy the PocketBase-backed application as a Docker Compose resource on Coolify's remote `Ubuntu-24-8G` server, with `https://sing.spike.network` assigned to the application service. The repository workflow verifies the source and triggers Coolify's deploy endpoint with a deploy-only token; Coolify and Traefik remain responsible for resource routing and TLS.

This keeps state in the PocketBase volume, avoids custom Docker networks that can conflict with Coolify's managed network, and avoids giving CI permission to modify infrastructure.
