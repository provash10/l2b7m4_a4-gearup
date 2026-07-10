CREATE TABLE "users"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NULL,
    "role" VARCHAR(255) CHECK
        (
            "role" IN('CUSTOMER', 'PROVIDER', 'ADMIN')
        ) NOT NULL DEFAULT 'CUSTOMER',
        "activeStatus" VARCHAR(255)
    CHECK
        ("activeStatus" IN('')) NOT NULL,
        "createdAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "users" ADD PRIMARY KEY("id");
ALTER TABLE
    "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
CREATE TABLE "categories"(
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NULL,
    "description" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL
);
ALTER TABLE
    "categories" ADD PRIMARY KEY("id");
ALTER TABLE
    "categories" ADD CONSTRAINT "categories_name_unique" UNIQUE("name");
ALTER TABLE
    "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");
CREATE TABLE "gear_items"(
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerDay" DECIMAL(8, 2) NOT NULL,
    "brand" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "isAvaiable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "gear_items" ADD PRIMARY KEY("id");
CREATE TABLE "rental_orders"(
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalPrice" DECIMAL(8, 2) NOT NULL,
    "orderStatus" VARCHAR(255) CHECK
        ("orderStatus" IN('')) NOT NULL DEFAULT 'PLACED',
        "createdAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "rental_orders" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "rental_orders"."orderStatus" IS 'PLACED, CONFIRMED, PAID, PICKEDUP, RETURNED, CANCELED';
CREATE TABLE "rental_order_items"(
    "id" UUID NOT NULL,
    "rentalOrderId" UUID NOT NULL,
    "gearItemId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(8, 2) NOT NULL
);
ALTER TABLE
    "rental_order_items" ADD PRIMARY KEY("id");
CREATE TABLE "payments"(
    "id" UUID NOT NULL,
    "rentalOrderId" UUID NOT NULL,
    "transactionId" TEXT NULL,
    "amount" DECIMAL(8, 2) NOT NULL,
    "method" VARCHAR(255) CHECK
        ("method" IN('STRIPE', 'SSLCOMMERZ')) NOT NULL DEFAULT 'STRIPE',
        "status" VARCHAR(255)
    CHECK
        (
            "status" IN('PENDING', 'COMPLETED', 'FAILED')
        ) NOT NULL DEFAULT 'PENDING',
        "paidAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "payments" ADD PRIMARY KEY("id");
CREATE TABLE "reviews"(
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "gearItemId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "reviews" ADD PRIMARY KEY("id");
ALTER TABLE
    "rental_order_items" ADD CONSTRAINT "rental_order_items_rentalorderid_foreign" FOREIGN KEY("rentalOrderId") REFERENCES "rental_orders"("id");
ALTER TABLE
    "rental_order_items" ADD CONSTRAINT "rental_order_items_gearitemid_foreign" FOREIGN KEY("gearItemId") REFERENCES "gear_items"("id");
ALTER TABLE
    "payments" ADD CONSTRAINT "payments_rentalorderid_foreign" FOREIGN KEY("rentalOrderId") REFERENCES "rental_orders"("id");
ALTER TABLE
    "reviews" ADD CONSTRAINT "reviews_gearitemid_foreign" FOREIGN KEY("gearItemId") REFERENCES "gear_items"("id");
ALTER TABLE
    "gear_items" ADD CONSTRAINT "gear_items_categoryid_foreign" FOREIGN KEY("categoryId") REFERENCES "categories"("id");
ALTER TABLE
    "gear_items" ADD CONSTRAINT "gear_items_providerid_foreign" FOREIGN KEY("providerId") REFERENCES "users"("id");
ALTER TABLE
    "reviews" ADD CONSTRAINT "reviews_customerid_foreign" FOREIGN KEY("customerId") REFERENCES "users"("id");
ALTER TABLE
    "rental_orders" ADD CONSTRAINT "rental_orders_customerid_foreign" FOREIGN KEY("customerId") REFERENCES "users"("id");