import { useEffect, useState } from 'react';
import { FAMILIAS_OLFATIVAS, GENEROS } from '../lib/constants';
import { formatCurrency } from '../lib/formatters';
import {
  compactImages,
  extractStoragePath,
  sanitizeInput,
  sanitizeTextarea,
  validateImageFile,
} from '../lib/security';
import {
  deleteStoragePaths,
  extractStoragePathsFromUrls,
  uploadImage,
  uploadManyImages,
} from '../lib/storage';
import { ensureSupabaseConfigured, supabase } from '../lib/supabase';
import { useToast } from './ToastProvider';

const EMPTY_FORM = {
  nome: '',
  marca: '',
  descricao: '',
  familia_olfativa: FAMILIAS_OLFATIVAS[0],
  genero: GENEROS[0],
  volume_ml: '',
  preco: '',
  preco_promocional: '',
  disponivel: true,
  destaque: false,
  imagem_capa: '',
  imagens_adicionais: [],
};

function ToggleField({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition duration-150 ${
        checked
          ? 'border-gold bg-gold/5'
          : 'border-line bg-white hover:border-slate/40'
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate">{hint}</p>
      </div>

      <span
        className={`table-toggle ${checked ? 'bg-gold' : 'bg-slate/30'}`}
        aria-hidden="true"
      >
        <span className={checked ? 'translate-x-6' : 'translate-x-1'} />
      </span>
    </button>
  );
}

function UploadArea({
  title,
  subtitle,
  multiple = false,
  onFiles,
  isActive,
  setIsActive,
}) {
  const accept = 'image/png,image/jpeg,image/webp';

  const handleSelection = (event) => {
    const files = Array.from(event.target.files || []);
    onFiles(files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsActive(false);
    onFiles(Array.from(event.dataTransfer.files || []));
  };

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center transition duration-150 ${
        isActive
          ? 'border-gold bg-gold/5'
          : 'border-line bg-white hover:border-gold/40'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsActive(true);
      }}
      onDragLeave={() => setIsActive(false)}
      onDrop={handleDrop}
    >
      <span className="text-lg font-semibold text-ink">+</span>
      <span className="mt-2 text-sm font-semibold text-ink">{title}</span>
      <span className="mt-1 max-w-xs text-xs leading-6 text-slate">
        {subtitle}
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleSelection}
        className="sr-only"
      />
    </label>
  );
}

export default function PerfumeForm({ perfume, onClose, onSaved }) {
  const { notify } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [coverDropActive, setCoverDropActive] = useState(false);
  const [galleryDropActive, setGalleryDropActive] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState([]);

  useEffect(() => {
    setForm(
      perfume
        ? {
            ...EMPTY_FORM,
            ...perfume,
            volume_ml: perfume.volume_ml ?? '',
            preco: perfume.preco ?? '',
            preco_promocional: perfume.preco_promocional ?? '',
            imagens_adicionais: compactImages(perfume.imagens_adicionais),
          }
        : EMPTY_FORM
    );
    setCoverFile(null);
    setGalleryFiles([]);
    setError('');
  }, [perfume]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(form.imagem_capa || '');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [coverFile, form.imagem_capa]);

  useEffect(() => {
    if (!galleryFiles.length) {
      setGalleryPreviewUrls([]);
      return undefined;
    }

    const previews = galleryFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setGalleryPreviewUrls(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [galleryFiles]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleToggleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const prepareFiles = (files, mode) => {
    if (!files.length) {
      return;
    }

    files.forEach((file) => validateImageFile(file));

    if (mode === 'cover') {
      setCoverFile(files[0]);
      return;
    }

    setGalleryFiles((current) => [...current, ...files]);
  };

  const handleRemoveExistingGallery = (urlToRemove) => {
    setForm((current) => ({
      ...current,
      imagens_adicionais: compactImages(current.imagens_adicionais).filter(
        (imageUrl) => imageUrl !== urlToRemove
      ),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const uploadedPaths = [];

    try {
      ensureSupabaseConfigured();

      const payload = {
        nome: sanitizeInput(form.nome, 120),
        marca: sanitizeInput(form.marca, 120),
        descricao: sanitizeTextarea(form.descricao, 1200),
        familia_olfativa: sanitizeInput(form.familia_olfativa, 60),
        genero: sanitizeInput(form.genero, 60),
        volume_ml: form.volume_ml ? Number.parseInt(form.volume_ml, 10) : null,
        preco: Number.parseFloat(form.preco),
        preco_promocional: form.preco_promocional
          ? Number.parseFloat(form.preco_promocional)
          : null,
        disponivel: Boolean(form.disponivel),
        destaque: Boolean(form.destaque),
      };

      if (!payload.nome || !payload.marca || Number.isNaN(payload.preco)) {
        throw new Error('Preencha nome, marca e um preco valido.');
      }

      if (payload.preco_promocional && payload.preco_promocional >= payload.preco) {
        throw new Error('O preco promocional deve ser menor que o preco original.');
      }

      let imageCover = form.imagem_capa || null;
      let galleryImages = compactImages(form.imagens_adicionais);
      const stalePaths = [];

      if (coverFile) {
        const upload = await uploadImage(coverFile, 'covers');
        uploadedPaths.push(upload.path);
        imageCover = upload.publicUrl;

        if (perfume?.imagem_capa) {
          const oldCoverPath = extractStoragePath(perfume.imagem_capa);

          if (oldCoverPath) {
            stalePaths.push(oldCoverPath);
          }
        }
      }

      if (!coverFile && perfume?.imagem_capa && !form.imagem_capa) {
        const removedCoverPath = extractStoragePath(perfume.imagem_capa);

        if (removedCoverPath) {
          stalePaths.push(removedCoverPath);
        }
      }

      if (galleryFiles.length) {
        const uploads = await uploadManyImages(galleryFiles, 'gallery');
        uploadedPaths.push(...uploads.map((item) => item.path));
        galleryImages = [
          ...galleryImages,
          ...uploads.map((item) => item.publicUrl),
        ];
      }

      if (perfume?.imagens_adicionais?.length) {
        const removedImages = compactImages(perfume.imagens_adicionais).filter(
          (url) => !galleryImages.includes(url)
        );
        stalePaths.push(...extractStoragePathsFromUrls(removedImages));
      }

      const finalPayload = {
        ...payload,
        imagem_capa: imageCover,
        imagens_adicionais: galleryImages,
      };

      let response;

      if (perfume?.id) {
        response = await supabase
          .from('perfumes')
          .update(finalPayload)
          .eq('id', perfume.id)
          .select('*')
          .single();
      } else {
        response = await supabase
          .from('perfumes')
          .insert(finalPayload)
          .select('*')
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      if (stalePaths.length) {
        deleteStoragePaths(stalePaths).catch(() => null);
      }

      notify({
        title: perfume ? 'Perfume atualizado' : 'Perfume criado',
        description: `${response.data.nome} foi salvo com sucesso.`,
        tone: 'success',
      });

      onSaved(response.data);
      onClose();
    } catch (currentError) {
      if (uploadedPaths.length) {
        deleteStoragePaths(uploadedPaths).catch(() => null);
      }

      const message =
        currentError.message || 'Nao foi possivel salvar o perfume agora.';

      setError(message);
      notify({
        title: 'Falha ao salvar',
        description: message,
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/30 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="mx-auto max-w-5xl rounded-xl border border-line bg-white shadow-velvet"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-line px-6 py-6 sm:px-8">
          <div>
            <p className="section-label">Painel</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-ink">
              {perfume ? 'Editar perfume' : 'Adicionar perfume'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate">
              Campos de texto sao sanitizados antes do envio e imagens passam por
              validacao de tipo, extensao e tamanho.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-sm font-semibold text-slate transition duration-150 hover:bg-mist hover:text-ink"
            aria-label="Fechar modal"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Nome</span>
                  <input
                    required
                    name="nome"
                    value={form.nome}
                    onChange={handleFieldChange}
                    className="field-shell"
                    placeholder="Ex.: Oud Satin Mood"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Marca</span>
                  <input
                    required
                    name="marca"
                    value={form.marca}
                    onChange={handleFieldChange}
                    className="field-shell"
                    placeholder="Ex.: Maison Francis Kurkdjian"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Descricao</span>
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleFieldChange}
                  rows={6}
                  className="field-shell min-h-[180px] resize-y"
                  placeholder="Descreva atmosfera, notas e personalidade."
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">
                    Familia olfativa
                  </span>
                  <select
                    name="familia_olfativa"
                    value={form.familia_olfativa}
                    onChange={handleFieldChange}
                    className="field-shell"
                  >
                    {FAMILIAS_OLFATIVAS.map((familia) => (
                      <option key={familia} value={familia}>
                        {familia}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Genero</span>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleFieldChange}
                    className="field-shell"
                  >
                    {GENEROS.map((genero) => (
                      <option key={genero} value={genero}>
                        {genero}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Volume (ml)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="volume_ml"
                    value={form.volume_ml}
                    onChange={handleFieldChange}
                    className="field-shell"
                    placeholder="100"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">Preco</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    name="preco"
                    value={form.preco}
                    onChange={handleFieldChange}
                    className="field-shell"
                    placeholder="299.90"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink">
                    Preco promocional
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="preco_promocional"
                    value={form.preco_promocional}
                    onChange={handleFieldChange}
                    className="field-shell"
                    placeholder="249.90"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <ToggleField
                  checked={form.disponivel}
                  onChange={(value) => handleToggleChange('disponivel', value)}
                  label="Disponivel"
                  hint="Controla a visibilidade do perfume no catalogo."
                />

                <ToggleField
                  checked={form.destaque}
                  onChange={(value) => handleToggleChange('destaque', value)}
                  label="Destaque"
                  hint="Os destaques ganham prioridade quando o catalogo esta sem filtros."
                />
              </div>

              <div className="card-shell p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">Imagem de capa</p>
                    <p className="mt-1 text-xs leading-6 text-slate">
                      JPG, PNG ou WEBP com ate 5 MB.
                    </p>
                  </div>

                  {coverPreviewUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setForm((current) => ({ ...current, imagem_capa: '' }));
                      }}
                      className="button-ghost"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>

                <div className="mt-4">
                  {coverPreviewUrl ? (
                    <div className="overflow-hidden rounded-lg border border-line">
                      <img
                        src={coverPreviewUrl}
                        alt="Pre-visualizacao da capa"
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className={coverPreviewUrl ? 'mt-4' : ''}>
                    <UploadArea
                      title="Arraste ou selecione a capa"
                      subtitle="Geramos um nome seguro com UUID e validamos o arquivo antes do upload."
                      onFiles={(files) => prepareFiles(files, 'cover')}
                      isActive={coverDropActive}
                      setIsActive={setCoverDropActive}
                    />
                  </div>
                </div>
              </div>

              <div className="card-shell p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Imagens adicionais
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate">
                      Monte uma galeria enxuta para a pagina do produto.
                    </p>
                  </div>

                  {galleryFiles.length ? (
                    <button
                      type="button"
                      onClick={() => setGalleryFiles([])}
                      className="button-ghost"
                    >
                      Limpar novos arquivos
                    </button>
                  ) : null}
                </div>

                <div className="mt-4">
                  <UploadArea
                    title="Adicionar imagens"
                    subtitle="Voce pode enviar varias imagens adicionais de uma vez."
                    multiple
                    onFiles={(files) => prepareFiles(files, 'gallery')}
                    isActive={galleryDropActive}
                    setIsActive={setGalleryDropActive}
                  />
                </div>

                {(form.imagens_adicionais.length || galleryPreviewUrls.length) ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {form.imagens_adicionais.map((imageUrl) => (
                      <div
                        key={imageUrl}
                        className="overflow-hidden rounded-lg border border-line bg-white"
                      >
                        <img
                          src={imageUrl}
                          alt="Imagem adicional"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingGallery(imageUrl)}
                          className="w-full border-t border-line px-4 py-3 text-sm font-medium text-slate transition duration-150 hover:bg-mist hover:text-ink"
                        >
                          Remover imagem atual
                        </button>
                      </div>
                    ))}

                    {galleryPreviewUrls.map((preview, index) => (
                      <div
                        key={`${preview.name}-${index}`}
                        className="overflow-hidden rounded-lg border border-line bg-white"
                      >
                        <img
                          src={preview.url}
                          alt={preview.name}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryFiles((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index)
                            )
                          }
                          className="w-full border-t border-line px-4 py-3 text-sm font-medium text-slate transition duration-150 hover:bg-mist hover:text-ink"
                        >
                          Remover novo arquivo
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">
                {form.preco
                  ? `Preco principal: ${formatCurrency(form.preco)}`
                  : 'Defina o preco principal do perfume'}
              </p>
              <p className="mt-1 text-xs leading-6 text-slate">
                O site atualiza automaticamente apos salvar no Supabase.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onClose} className="button-secondary">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="button-primary gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Salvando...
                  </>
                ) : (
                  'Salvar perfume'
                )}
              </button>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
