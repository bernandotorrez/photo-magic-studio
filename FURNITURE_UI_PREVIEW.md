# 🎨 Preview UI - Fitur Pilihan Furniture

## Tampilan UI Fitur Pilihan Furniture

### 📍 Lokasi
Fitur ini muncul di halaman **Interior Design** setelah user memilih enhancement **"Virtual Staging"**

---

## 🖼️ Layout UI

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Pilih Item Furniture (Opsional)                         │
│                                                               │
│  Pilih item furniture yang ingin ditambahkan ke ruangan.     │
│  Kosongkan untuk furniture otomatis.                         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 🛋️ Sofa │  │ 🛏️ Kasur │  │ 📺 Meja  │  │ 📚 Rak   │   │
│  │          │  │          │  │    TV    │  │   Buku   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 👔 Lemari│  │ 🍽️ Meja  │  │ ☕ Meja  │  │ 🪑 Kursi │   │
│  │          │  │   Makan  │  │   Kopi   │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 🟫 Karpet│  │ 💡 Lampu │  │ 🪴 Tanaman│ │ 🖼️ Lukisan│  │
│  │          │  │          │  │   Hias   │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 🪟 Gorden│  │ 🪞 Cermin│  │ 🖥️ Meja  │                  │
│  │          │  │          │  │   Kerja  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  Atau Tambahkan Item Custom                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Contoh: vas bunga, bantal sofa, jam dinding           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Opsional: Tambahkan item furniture lain yang tidak ada      │
│  di pilihan (pisahkan dengan koma)                           │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ✓ Item yang akan ditambahkan:                         │  │
│  │   sofa modern, meja TV minimalis, karpet, tanaman hias│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual States

### 1. Default State (Tidak Dipilih)
```
┌──────────┐
│ 🛋️ Sofa │  ← Border abu-abu, background putih
│          │
└──────────┘
```

### 2. Selected State (Dipilih)
```
┌──────────┐
│ 🛋️ Sofa │  ← Border biru (primary), background biru muda
│        ✓ │  ← Check icon muncul
└──────────┘
```

### 3. Hover State
```
┌──────────┐
│ 🛋️ Sofa │  ← Border biru transparan, background abu-abu muda
│          │
└──────────┘
```

### 4. Disabled State (Saat Generating)
```
┌──────────┐
│ 🛋️ Sofa │  ← Opacity 50%, cursor not-allowed
│          │
└──────────┘
```

---

## 📱 Responsive Design

### Mobile (< 640px)
```
Grid: 2 kolom
Spacing: gap-2
Padding: p-2

┌─────────┐ ┌─────────┐
│ 🛋️ Sofa│ │🛏️ Kasur │
└─────────┘ └─────────┘

┌─────────┐ ┌─────────┐
│📺 Meja  │ │📚 Rak   │
│   TV    │ │  Buku   │
└─────────┘ └─────────┘
```

### Tablet (640px - 768px)
```
Grid: 3 kolom
Spacing: gap-2
Padding: p-3

┌────────┐ ┌────────┐ ┌────────┐
│🛋️ Sofa│ │🛏️ Kasur│ │📺 Meja │
│        │ │        │ │   TV   │
└────────┘ └────────┘ └────────┘
```

### Desktop (> 768px)
```
Grid: 3 kolom
Spacing: gap-2
Padding: p-3

┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🛋️ Sofa │ │ 🛏️ Kasur │ │ 📺 Meja  │
│          │ │          │ │    TV    │
└──────────┘ └──────────┘ └──────────┘
```

---

## 🎯 Interactive Elements

### Button Furniture
- **Type**: Button element
- **Padding**: p-2 sm:p-3
- **Border**: border-2
- **Border Radius**: rounded-lg
- **Transition**: transition-all duration-200
- **Cursor**: cursor-pointer (default), cursor-not-allowed (disabled)

### Preview Box
- **Background**: bg-primary/5
- **Border**: border-primary/20
- **Padding**: p-3
- **Border Radius**: rounded-lg
- **Text Color**: text-primary (title), text-muted-foreground (content)

### Custom Input
- **Component**: Input (shadcn/ui)
- **Placeholder**: "Contoh: vas bunga, bantal sofa, jam dinding"
- **Disabled State**: Saat generating

---

## 🎨 Color Scheme

### Primary Colors
- **Selected Border**: `border-primary`
- **Selected Background**: `bg-primary/10`
- **Check Icon**: `text-primary`

### Secondary Colors
- **Default Border**: `border-border`
- **Hover Border**: `border-primary/50`
- **Hover Background**: `hover:bg-muted/50`

### Text Colors
- **Title**: `text-sm font-medium`
- **Description**: `text-xs text-muted-foreground`
- **Preview Title**: `text-xs font-medium text-primary`

---

## 🔄 Animation & Transitions

### Hover Effect
```css
transition-all duration-200
hover:border-primary/50
hover:bg-muted/50
```

### Selected Effect
```css
border-primary
bg-primary/10
shadow-sm
```

### Check Icon Animation
```css
/* Muncul dengan smooth transition */
<Check className="w-3 h-3 text-primary" />
```

---

## 📐 Spacing & Layout

### Container
```css
space-y-3 sm:space-y-4
p-3 sm:p-4
rounded-xl
border border-primary/30
bg-primary/5
```

### Grid
```css
grid grid-cols-2 sm:grid-cols-3 gap-2
```

### Preview Box
```css
p-3
rounded-lg
bg-primary/5
border border-primary/20
```

---

## 🎭 Icons & Emojis

Setiap furniture item menggunakan emoji yang relevan:
- 🛋️ Sofa
- 🛏️ Kasur
- 📺 Meja TV
- 📚 Rak Buku
- 👔 Lemari
- 🍽️ Meja Makan
- ☕ Meja Kopi
- 🪑 Kursi
- 🟫 Karpet
- 💡 Lampu
- 🪴 Tanaman Hias
- 🖼️ Lukisan
- 🪟 Gorden
- 🪞 Cermin
- 🖥️ Meja Kerja

Plus icon untuk selected state:
- ✓ Check (dari lucide-react)

---

## 🎬 User Flow

```
1. User upload foto ruangan
   ↓
2. User pilih "Virtual Staging"
   ↓
3. Section furniture selection muncul
   ↓
4. User klik furniture yang diinginkan
   ↓
5. Button berubah warna (selected state)
   ↓
6. Preview box muncul menampilkan item terpilih
   ↓
7. (Opsional) User tambah item custom
   ↓
8. User klik "Generate"
   ↓
9. AI generate gambar dengan furniture terpilih
```

---

## 💻 Code Structure

### Component Hierarchy
```
EnhancementOptions
  └── Furniture Selection Section
      ├── Header (Title + Description)
      ├── Furniture Grid
      │   └── Furniture Buttons (15 items)
      ├── Custom Input
      └── Preview Box (conditional)
```

### State Management
```typescript
selectedFurnitureItems: string[]  // Array of selected items
customFurniture: string           // Custom input text
```

### Key Functions
```typescript
handleToggleFurnitureItem()  // Toggle selection
getFurnitureString()         // Combine items
```

---

## 🎯 Accessibility

- ✅ Keyboard navigation support
- ✅ Clear visual feedback
- ✅ Disabled state indication
- ✅ Descriptive labels
- ✅ Responsive touch targets (min 44x44px)

---

## 🚀 Performance

- ✅ Minimal re-renders
- ✅ Efficient state updates
- ✅ Smooth transitions (200ms)
- ✅ Optimized grid layout

---

**UI Design by: Kiro AI Assistant** 🎨✨
