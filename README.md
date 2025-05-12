```sh
docker compose up
```

Once the backend is running you can use it to generate admin keys for the
dashboard/CLI:

```sh
docker compose exec backend ./generate_admin_key.sh
```