---
title: Database User Permissions
description: A guide in my new Starlight docs site.
lastUpdated: 2025-08-01
---

This page outlines how database user permissions are structured and managed in Postgres using Terraform.

---


## Setup

Terraform is used to manage infrastructure as code (IaC). By leveraging the Postgres provider, Postgres resources can be declaratively provisioned and managed, including databases, schemas, and roles.

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

Permissions are categorized and managed at the schema-wide level into three distinct groups:

1. Read Only - For services that only need to query data.
2. Read + Write - For services that need to both query and modify data within specific schemas.
3. Admin - For roles requiring elevated privileges for things like dropping tables

### Examples
- dbt: Requires read-only access to source schemas, but admin access to Marts for operations like dropping tables etc
- Ingestion Script: Requires read + write access to source schemas for data loading tasks.
- REST API: Requires read + write access to Marts Schema for fetching data and performing various table updates 

---

### Terraform Example

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

### Future Grants

In Postgres, traditional `GRANT` statements only apply to tables or views that exist at the time the grant is issued.

Default Privileges are used to manage permissions for future objects, which automatically apply specified permissions to tables, views, and other objects created later within a schema.

The Terraform Modules are setup to set both of these permission types when building out Schemas.