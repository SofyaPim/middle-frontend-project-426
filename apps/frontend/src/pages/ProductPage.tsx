import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiProduct } from "../api";
import type { components } from "../generated/schema";
import { ProductImage } from "../components/ProductImage";
import { useCart } from "../cart";
import { formatPrice } from "../lib/format";

type Product = components["schemas"]["Product"];


export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { items, addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);

    apiProduct(slug, controller.signal)
      .then((data) => setProduct(data))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "NOT_FOUND") {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  const inCartQuantity = product?.id ? (items.find((item) => item.productId === product.id)?.quantity ?? 0) : 0;

  if (loading) {
    return (
      <main className="page-shell">
        <p className="intro">Загрузка…</p>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="page-shell" data-testid="product-page">
        <p className="eyebrow">404 / CATALOG</p>
        <h1>Товар не найден</h1>
        <p className="intro">Возможно, товар снят с продажи или ссылка устарела.</p>
        <Link className="btn-primary" to="/catalog">
          Открыть каталог <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell" data-testid="product-page">
      <p className="eyebrow">{product.category.name}</p>
      <h1 data-testid="product-name">{product.name}</h1>

      <ProductImage src={product.imageUrl} alt={product.name} imageClassName="product-page__image" placeholderClassName="product-page__image product-page__image--placeholder" testId="product-image" />

      <p className="product-page__price" data-testid="product-price">
        {formatPrice(product.price)} ₽
      </p>
      <p className={`product-page__availability product-page__availability--${product.available ? "in" : "out"}`} data-testid="product-availability" data-available={String(product.available)}>
        {product.available ? "В наличии" : "Нет в наличии"}
      </p>
      <p className="product-page__description" data-testid="product-description">
        {product.description}
      </p>
      <div className="product-page__actions">
        <button type="button" className="btn-primary" onClick={() => addToCart(product.id)} disabled={!product.available} data-testid="product-add-to-cart">
          {product.available ? (inCartQuantity > 0 ? `В корзине: ${inCartQuantity} шт` : "В корзину") : "Нет в наличии"}
        </button>
        <Link className="btn-primary" to="/catalog">
          В каталог <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
