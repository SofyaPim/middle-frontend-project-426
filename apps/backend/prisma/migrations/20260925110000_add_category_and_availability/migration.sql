CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

ALTER TABLE "Product" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Product" ADD COLUMN "categoryId" INTEGER;

INSERT INTO "Category" ("slug", "name", "createdAt", "updatedAt") VALUES
('gpus', 'Видеокарты', now(), now()),
('cpus', 'Процессоры', now(), now());

UPDATE "Product" SET "categoryId" = c."id" FROM "Category" c WHERE c."name" = "Product"."category";

ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Product" DROP COLUMN "category";

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;