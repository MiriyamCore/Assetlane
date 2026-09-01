import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowRight, LoaderCircle, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MarkdownField } from '../../components/admin/MarkdownField';
import { ProductAttributesEditor } from '../../components/admin/ProductAttributesEditor';
import { apiFetch } from '../../lib/api';
import { STORE_CURRENCY_LABELS, normalizeStoreCurrency } from '../../lib/currency';
import { emptyProductForm, parseTagsInput, productToFormState } from '../../lib/product-form';
import { buildEmbedScriptSnippet } from '../../lib/embed-snippet';
import type { Product, ProductFormState } from '../../types/store';
import { InlineError } from '../../components/ui/States';

const steps = [
  { title: 'Basics', description: 'Name the product, define the slug, and decide how buyers will understand it quickly.' },
  { title: 'Pricing & release', description: 'Set commercial details, versioning, status, and buyer-facing delivery copy.' },
  { title: 'Assets', description: 'Attach the private file plus the images used by the storefront.' },
  { title: 'SEO & review', description: 'Review tags and metadata, then save the product.' },
] as const;

export function ProductEditorPage({
  mode,
  product,
  defaultCurrency,
  storeUrl,
  onSaved,
}: {
  mode: 'create' | 'edit';
  product?: Product | null;
  defaultCurrency: string;
  storeUrl: string;
  onSaved: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProductFormState>(() => (product ? productToFormState(product) : emptyProductForm(defaultCurrency)));

  useEffect(() => {
    setForm(product ? productToFormState(product) : emptyProductForm(defaultCurrency));
  }, [product, defaultCurrency]);

  const storeCurrency = normalizeStoreCurrency(defaultCurrency);
  const currentStep = steps[step] || steps[0];

  const nextStep = () => {
    if (step === 0 && (!form.title || !form.summary || !form.description)) {
      setError('Title, summary, and description are required before continuing.');
      return;
    }

    if (step === 1 && !form.priceCents) {
      setError('Price is required before continuing.');
      return;
    }

    setError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const previousStep = () => {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('slug', form.slug);
      formData.append('summary', form.summary);
      formData.append('description', form.description);
      formData.append('tags', JSON.stringify(parseTagsInput(form.tags)));
      formData.append('priceCents', form.priceCents);
      formData.append('currency', storeCurrency);
      formData.append('status', form.status);
      formData.append('version', form.version);
      formData.append('changelog', form.changelog);
      formData.append('seoTitle', form.seoTitle);
      formData.append('metaDescription', form.metaDescription);
      formData.append('attributes', JSON.stringify(form.attributes.filter((item) => item.label.trim() && item.value.trim())));

      if (form.featuredImage) formData.append('featuredImage', form.featuredImage);
      form.galleryImages.forEach((image) => formData.append('galleryImages', image));
      if (form.digitalFile) formData.append('digitalFile', form.digitalFile);
      form.digitalFiles.forEach((file) => formData.append('digitalFiles', file));

      const path = mode === 'edit' && product ? `/products/${product.id}` : '/products';
      await apiFetch(path, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        body: formData,
      });

      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="editor-fields">
            <div className="form-grid">
              <label>
                Title
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
              </label>
              <label>
                Slug
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
              </label>
            </div>
            <label>
              Summary
              <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={3} required />
            </label>
            <label>
              Description
              <MarkdownField
                required
                value={form.description}
                onChange={(description) => setForm({ ...form, description })}
              />
            </label>
            <label>
              Tags
              <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="launch, templates, productivity" />
            </label>
          </div>
        );

      case 1:
        return (
          <div className="editor-fields">
            <div className="form-grid">
              <label>
                Price in cents
                <input value={form.priceCents} onChange={(event) => setForm({ ...form, priceCents: event.target.value })} required />
                <small>Use 0 for free products.</small>
              </label>
              <label>
                Store currency
                <input readOnly value={STORE_CURRENCY_LABELS[storeCurrency]} />
                <small>Change under Settings → Delivery.</small>
              </label>
              <label>
                Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Product['status'] })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                Version
                <input value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} />
              </label>
            </div>
            <label>
              Changelog
              <textarea value={form.changelog} onChange={(event) => setForm({ ...form, changelog: event.target.value })} rows={5} />
            </label>
            <ProductAttributesEditor
              attributes={form.attributes}
              onChange={(attributes) => setForm({ ...form, attributes })}
            />
          </div>
        );

      case 2:
        return (
          <div className="editor-fields">
            <label>
              Featured image
              <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, featuredImage: event.target.files?.[0] || null })} />
            </label>
            <label>
              Gallery images
              <input type="file" accept="image/*" multiple onChange={(event) => setForm({ ...form, galleryImages: Array.from(event.target.files || []) })} />
            </label>
            <label>
              Private digital files
              <input type="file" multiple onChange={(event) => setForm({ ...form, digitalFiles: Array.from(event.target.files || []) })} />
              <small>First file becomes the primary download. Additional files are bundled with the purchase.</small>
            </label>
            <label>
              Replace primary digital file
              <input type="file" onChange={(event) => setForm({ ...form, digitalFile: event.target.files?.[0] || null })} />
            </label>
            <div className="upload-summary">
              <div>
                <strong>Featured image</strong>
                <span>{form.featuredImage?.name || (product?.featuredImageUrl ? 'Will keep current asset' : 'Not set')}</span>
              </div>
              <div>
                <strong>Gallery assets</strong>
                <span>{form.galleryImages.length > 0 ? `${form.galleryImages.length} selected` : `${product?.galleryImageUrls.length || 0} existing`}</span>
              </div>
              <div>
                <strong>Digital files</strong>
                <span>
                  {form.digitalFiles.length > 0
                    ? `${form.digitalFiles.length} new file(s) selected`
                    : product?.files?.length
                      ? `${product.files.length} existing`
                      : product?.digitalFileName || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="editor-fields">
            <div className="form-grid">
              <label>
                SEO title
                <input value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} />
              </label>
              <label>
                Meta description
                <input value={form.metaDescription} onChange={(event) => setForm({ ...form, metaDescription: event.target.value })} />
              </label>
            </div>
            <div className="review-card">
              <strong>{form.title || 'Untitled product'}</strong>
              <span>{form.summary || 'No summary yet'}</span>
              <span>{parseTagsInput(form.tags).length ? parseTagsInput(form.tags).join(', ') : 'No tags added'}</span>
              <span>{form.priceCents ? `${Number(form.priceCents) / 100} ${storeCurrency}` : 'Price not set'}</span>
              {form.attributes.filter((item) => item.label && item.value).length ? (
                <span>{form.attributes.filter((item) => item.label && item.value).length} custom attribute(s)</span>
              ) : null}
            </div>
            {mode === 'edit' && product?.slug ? (
              <div className="settings-note-card embed-snippet-block">
                <strong>Embed checkout snippet</strong>
                <span>Paste this on an external site that is listed under Settings → Distribution → Embed allowed origins.</span>
                <pre>{buildEmbedScriptSnippet(storeUrl, product.slug)}</pre>
              </div>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form className="editor-workspace" onSubmit={submitProduct}>
      <nav aria-label="Product editor steps" className="editor-nav">
        <Link className="editor-nav-back" to="/admin/products">
          <ArrowLeft size={14} />
          <span>Products</span>
        </Link>
        <span className="editor-nav-label">Steps</span>
        {steps.map((item, index) => (
          <button
            key={item.title}
            aria-current={index === step ? 'step' : undefined}
            className={index === step ? 'editor-nav-item active' : 'editor-nav-item'}
            type="button"
            onClick={() => {
              setError('');
              setStep(index);
            }}
          >
            {index + 1}. {item.title}
          </button>
        ))}
      </nav>

      <div className="editor-panel-main">
        <header className="editor-panel-header">
          <p className="editor-step-progress">
            Step {step + 1} of {steps.length}
          </p>
          <h2>{currentStep.title}</h2>
          <p>{currentStep.description}</p>
        </header>

        {error ? <InlineError message={error} /> : null}

        <div className="editor-panel-body">{renderStepContent()}</div>

        <footer className="editor-panel-footer">
          <button className="secondary-button" type="button" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
          <div className="editor-action-group">
            {step > 0 ? (
              <button className="secondary-button" type="button" onClick={previousStep}>
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button className="primary-button" type="button" onClick={nextStep}>
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button className="primary-button" disabled={saving} type="submit">
                {saving ? <LoaderCircle className="spin" size={14} /> : <Save size={14} />}
                <span>{mode === 'edit' ? 'Save product' : 'Create product'}</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </form>
  );
}
