# Supabase Cloud Database Schema

This file contains the exact active database schema for our production Supabase Cloud database. Refer to this data schema whenever building queries, writing custom hooks, configuring database relations, or adding features to the application.

## Active Schema Dump
```json
[
  {
    "schema_json": [
      {
        "table_name": "blocks",
        "column_name": "blocked_id",
        "data_type": "uuid"
      },
      {
        "table_name": "blocks",
        "column_name": "blocker_id",
        "data_type": "uuid"
      },
      {
        "table_name": "categories",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "categories",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "categories",
        "column_name": "name",
        "data_type": "text"
      },
      {
        "table_name": "categories",
        "column_name": "subcategories",
        "data_type": "jsonb"
      },
      {
        "table_name": "chat_messages",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "chat_messages",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_messages",
        "column_name": "is_read",
        "data_type": "boolean"
      },
      {
        "table_name": "chat_messages",
        "column_name": "message_text",
        "data_type": "text"
      },
      {
        "table_name": "chat_messages",
        "column_name": "room_id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_messages",
        "column_name": "sender_id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_rooms",
        "column_name": "buyer_id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_rooms",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "chat_rooms",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_rooms",
        "column_name": "product_id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_rooms",
        "column_name": "seller_id",
        "data_type": "uuid"
      },
      {
        "table_name": "chat_rooms",
        "column_name": "updated_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "notifications",
        "column_name": "created_at",
        "data_type": "timestamp without time zone"
      },
      {
        "table_name": "notifications",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "notifications",
        "column_name": "is_read",
        "data_type": "boolean"
      },
      {
        "table_name": "notifications",
        "column_name": "message",
        "data_type": "text"
      },
      {
        "table_name": "notifications",
        "column_name": "order_id",
        "data_type": "uuid"
      },
      {
        "table_name": "notifications",
        "column_name": "title",
        "data_type": "text"
      },
      {
        "table_name": "notifications",
        "column_name": "type",
        "data_type": "text"
      },
      {
        "table_name": "notifications",
        "column_name": "user_id",
        "data_type": "uuid"
      },
      {
        "table_name": "order_items",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "order_items",
        "column_name": "order_id",
        "data_type": "uuid"
      },
      {
        "table_name": "order_items",
        "column_name": "price_snapshot",
        "data_type": "numeric"
      },
      {
        "table_name": "order_items",
        "column_name": "product_name_snapshot",
        "data_type": "text"
      },
      {
        "table_name": "order_items",
        "column_name": "quantity",
        "data_type": "integer"
      },
      {
        "table_name": "order_items",
        "column_name": "size_id",
        "data_type": "uuid"
      },
      {
        "table_name": "order_items",
        "column_name": "variant_id",
        "data_type": "uuid"
      },
      {
        "table_name": "orders",
        "column_name": "city",
        "data_type": "text"
      },
      {
        "table_name": "orders",
        "column_name": "created_at",
        "data_type": "timestamp without time zone"
      },
      {
        "table_name": "orders",
        "column_name": "delivery_address",
        "data_type": "text"
      },
      {
        "table_name": "orders",
        "column_name": "email",
        "data_type": "text"
      },
      {
        "table_name": "orders",
        "column_name": "full_name",
        "data_type": "text"
      },
      {
        "table_name": "orders",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "orders",
        "column_name": "phone",
        "data_type": "text"
      },
      {
        "table_name": "orders",
        "column_name": "product_id",
        "data_type": "uuid"
      },
      {
        "table_name": "orders",
        "column_name": "status",
        "data_type": "USER-DEFINED"
      },
      {
        "table_name": "orders",
        "column_name": "user_id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_images",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "product_images",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_images",
        "column_name": "image_url",
        "data_type": "text"
      },
      {
        "table_name": "product_images",
        "column_name": "is_main",
        "data_type": "boolean"
      },
      {
        "table_name": "product_images",
        "column_name": "product_id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_images",
        "column_name": "sort_order",
        "data_type": "integer"
      },
      {
        "table_name": "product_sizes",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_sizes",
        "column_name": "size",
        "data_type": "text"
      },
      {
        "table_name": "product_sizes",
        "column_name": "size_id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_sizes",
        "column_name": "stock",
        "data_type": "integer"
      },
      {
        "table_name": "product_sizes",
        "column_name": "variant_id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_variants",
        "column_name": "color",
        "data_type": "text"
      },
      {
        "table_name": "product_variants",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "product_variants",
        "column_name": "product_id",
        "data_type": "uuid"
      },
      {
        "table_name": "products",
        "column_name": "active",
        "data_type": "boolean"
      },
      {
        "table_name": "products",
        "column_name": "category_id",
        "data_type": "uuid"
      },
      {
        "table_name": "products",
        "column_name": "created_at",
        "data_type": "timestamp without time zone"
      },
      {
        "table_name": "products",
        "column_name": "description",
        "data_type": "text"
      },
      {
        "table_name": "products",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "products",
        "column_name": "is_deleted",
        "data_type": "boolean"
      },
      {
        "table_name": "products",
        "column_name": "moq",
        "data_type": "integer"
      },
      {
        "table_name": "products",
        "column_name": "name",
        "data_type": "text"
      },
      {
        "table_name": "products",
        "column_name": "price",
        "data_type": "numeric"
      },
      {
        "table_name": "products",
        "column_name": "selected_category",
        "data_type": "text"
      },
      {
        "table_name": "products",
        "column_name": "seller_id",
        "data_type": "uuid"
      },
      {
        "table_name": "products",
        "column_name": "status",
        "data_type": "USER-DEFINED"
      },
      {
        "table_name": "products",
        "column_name": "subcategory_id",
        "data_type": "uuid"
      },
      {
        "table_name": "profiles",
        "column_name": "address",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "avatar_url",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "created_at",
        "data_type": "timestamp without time zone"
      },
      {
        "table_name": "profiles",
        "column_name": "district",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "full_name",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "profiles",
        "column_name": "phone",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "role",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "status",
        "data_type": "USER-DEFINED"
      },
      {
        "table_name": "profiles",
        "column_name": "store_name",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "store_type",
        "data_type": "text"
      },
      {
        "table_name": "profiles",
        "column_name": "upazila",
        "data_type": "text"
      },
      {
        "table_name": "reports",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "reports",
        "column_name": "details",
        "data_type": "text"
      },
      {
        "table_name": "reports",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "reports",
        "column_name": "product_id",
        "data_type": "uuid"
      },
      {
        "table_name": "reports",
        "column_name": "profile_id",
        "data_type": "uuid"
      },
      {
        "table_name": "reports",
        "column_name": "reason",
        "data_type": "USER-DEFINED"
      },
      {
        "table_name": "reports",
        "column_name": "reporter_id",
        "data_type": "uuid"
      },
      {
        "table_name": "reports",
        "column_name": "status",
        "data_type": "USER-DEFINED"
      },
      {
        "table_name": "reports",
        "column_name": "target_type",
        "data_type": "USER-DEFINED"
      },
      {
        "table_name": "sizes",
        "column_name": "category",
        "data_type": "text"
      },
      {
        "table_name": "sizes",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "sizes",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "sizes",
        "column_name": "label",
        "data_type": "text"
      },
      {
        "table_name": "sizes",
        "column_name": "sort_order",
        "data_type": "integer"
      },
      {
        "table_name": "subcategories",
        "column_name": "category_id",
        "data_type": "uuid"
      },
      {
        "table_name": "subcategories",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "subcategories",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "subcategories",
        "column_name": "name",
        "data_type": "text"
      },
      {
        "table_name": "support_requests",
        "column_name": "created_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "support_requests",
        "column_name": "id",
        "data_type": "uuid"
      },
      {
        "table_name": "support_requests",
        "column_name": "is_read",
        "data_type": "boolean"
      },
      {
        "table_name": "support_requests",
        "column_name": "message",
        "data_type": "text"
      },
      {
        "table_name": "support_requests",
        "column_name": "status",
        "data_type": "text"
      },
      {
        "table_name": "support_requests",
        "column_name": "subject",
        "data_type": "text"
      },
      {
        "table_name": "support_requests",
        "column_name": "updated_at",
        "data_type": "timestamp with time zone"
      },
      {
        "table_name": "support_requests",
        "column_name": "user_id",
        "data_type": "uuid"
      }
    ]
  }
]