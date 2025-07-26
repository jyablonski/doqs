---
title: Database User Permissions
description: A guide in my new Starlight docs site.
lastUpdated: 2025-07-26
---

This page outlines how database user permissions are structured and managed in Postgres using Terraform.

---


## Setup

Terraform is used to manage infrastructure as code (IaC). By leveraging the Postgres provider, we can declaratively provision and manage Postgres resources, including databases, schemas, and roles.

### Custom Terraform Modules

Custom Terraform modules are maintained for managing Postgres resources:

- [Postgres Modules Repository](https://github.com/jyablonski/aws_terraform/tree/master/modules/postgresql)

These modules handle the creation of:
- Databases
- Schemas
- Roles

All permissions are managed at the schema level to maintain a clean and scalable permission model. This ensures that permissions are defined in code, making them easy to audit and maintain.

---

## Permissions Model

Permissions are categorized into three distinct levels:

1. Read Only - For services that only need to query data.

2. Read + Write - For services that need to both query and modify data within specific schemas.

3. Admin - For roles requiring elevated privileges to manage schema-level operations (e.g., altering or dropping tables etc).

### Examples
- dbt: Requires read-only access to source schemas but admin access to marts.
- Ingestion Scripts: Require read + write access to source schemas for data loading tasks.
- Admin Users: Require admin access for governance and maintenance tasks.

> Note: Permissions should be managed at the schema level, not at the table level. Schemas are the appropriate abstraction for controlling access in Postgres.

---

## Terraform Example

Below is an example of how roles and schema permissions are defined using the modules:

```hcl
# Create dbt role
module "dbt_role_prod" {
  source        = "./modules/postgresql/role"
  role_name     = "dbt_role_prod"
  role_password = "${var.es_master_pw}dbt"
}

# Create marts schema with role-based access
module "marts_schema" {
  source = "./modules/postgresql/schema"

  schema_name   = "marts"
  database_name = var.jacobs_rds_db
  schema_owner  = var.postgres_username

  read_access_roles  = [module.dash_role_prod.role_name, module.ml_role_prod.role_name, module.ingestion_role_prod.role_name]
  write_access_roles = [module.rest_api_role_prod.role_name]
  admin_access_roles = [var.postgres_username, module.dbt_role_prod.role_name]
}
```

## Future Grants

In Postgres, traditional grants only apply to existing tables or views within a schema at the time the grant is issued.

To handle future grants—permissions on objects that will be created later—you can leverage default privileges. These allow you to define automatic permissions on future tables, views, or other objects within a schema.

### Key Points
- Default privileges assign specific grants to a role for any objects created in the future within a given schema.
- This ensures that roles automatically receive the appropriate permissions as new tables or views are created.

For example, you can configure a role to automatically receive `SELECT` or `INSERT` privileges on any future tables in a schema.

### Comparison
- In Postgres:  
  You set this via `ALTER DEFAULT PRIVILEGES` within the schema.

- In Snowflake:  
  The concept is more explicit and handled with specific statements such as:  
  ```sql
  GRANT SELECT, INSERT ON FUTURE TABLES IN SCHEMA x TO ROLE y;
  ```
