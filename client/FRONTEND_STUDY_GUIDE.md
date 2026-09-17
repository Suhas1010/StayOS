# StayOS Frontend — Comprehensive Beginner Study Guide 🎓

Welcome to the frontend of **StayOS**! This guide is written specifically for you so that whenever you dive into learning frontend development, you have a crystal-clear, step-by-step mental model of how this application is structured and how modern React web applications work.

---

## 1. High-Level Anatomy: What Is Going On Here?

In traditional web development, clicking a link causes the browser to request a whole new HTML file from the server, causing a visible white flash and full page reload.

In a **Single Page Application (SPA)** built with **React** and **Vite**:
1. The browser downloads a single `index.html` file once.
2. A JavaScript bundle (`main.jsx` and `App.jsx`) executes inside the browser.
3. React dynamically creates, updates, and deletes HTML elements inside the `<div id="root"></div>` using JavaScript.
4. When you click a link (like switching from *Dashboard* to *Properties*), **React Router** simply swaps out which component is visible on screen in milliseconds without reloading the browser!

---

## 2. Directory Structure Explained

Look inside the `client/src/` folder:

```text
client/src/
├── api/          # 🌐 Networking Layer (Communicating with Express backend)
├── context/      # 🧠 Global State (Data shared across the entire app)
├── components/   # 🧱 Reusable UI Bricks (Buttons, Modals, Badges, Sidebar)
├── pages/        # 📄 Full View Screens (Login, Dashboard, Properties)
├── styles/       # 🎨 Modular Vanilla CSS (Design tokens, layouts, animations)
├── App.jsx       # 🚦 Central Router & Route Guards
└── main.jsx      # 🔌 Entry Point (Attaches React to index.html)
```

### Why this separation matters:
- **Separation of Concerns**: A page component shouldn't worry about raw `fetch()` or `axios` syntax; it just calls `propertyApi.getProperties()`.
- **Reusability**: Instead of recreating a popup dialogue on 5 different pages, we create `<Modal>` once in `components/common/` and reuse it anywhere with `<Modal isOpen={...} title="...">`.

---

## 3. Core React Concepts Used in StayOS

### A. Components & JSX
A component is simply a JavaScript function that returns **JSX** (HTML-like syntax inside JavaScript):
```jsx
// components/common/Badge.jsx
export const Badge = ({ children, variant }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
};
```
- **Props** (`children`, `variant`) are inputs passed to a component, exactly like arguments passed to a function.

---

### B. State Management with `useState`
When data in your UI can change over time (e.g., text in an input box, open/closed modal, or an array of rooms), you store it in **State**:
```jsx
const [isOpen, setIsOpen] = useState(false);

// Clicking a button updates the state:
<button onClick={() => setIsOpen(true)}>Open Modal</button>
```
Whenever `setIsOpen` is called, React **re-renders** the component and updates only the necessary part of the DOM.

---

### C. Side Effects with `useEffect`
Whenever you need to interact with something outside of React (like making an HTTP call to your Express backend when a page loads), you use `useEffect`:
```jsx
useEffect(() => {
  const fetchRooms = async () => {
    setLoading(true);
    const res = await roomApi.getRooms(propertyId);
    setRooms(res.data.rooms);
    setLoading(false);
  };

  fetchRooms();
}, [propertyId]); // <-- Dependency Array: Re-run only when propertyId changes!
```
- If the dependency array is empty `[]`, it runs **only once** when the component first appears on screen.

---

### D. Global State with `useContext`
Normally, to share data between components, you must pass props down from parent to child. If a deeply nested button needs to know who the logged-in user is, passing props through 6 intermediate layers is called *prop drilling*.

**React Context** solves this by creating a global "broadcast channel":
- In `context/AuthContext.jsx`, we provide `user`, `login`, and `logout`.
- Any component in the app can simply call:
```jsx
const { user, isOwner, logout } = useAuth();
```

---

## 4. How the Frontend Connects to the Backend (Axios & REST)

Look at `src/api/client.js`:

```javascript
const apiClient = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // Sends HTTP-only cookies (refresh token) automatically
});
```

### Request Interceptor (Attaching JWT Tokens)
Before any request leaves the browser, our interceptor automatically grabs the JWT token from `localStorage` and adds the authorization header:
```javascript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("stayos_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Vite Dev Proxy
In `client/vite.config.js`:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000', // Points to our Express backend!
      changeOrigin: true,
    }
  }
}
```
This avoids CORS issues during development!

---

## 5. Client-Side Routing & Protected Routes

In `src/App.jsx`, we declare our application's routes using `react-router-dom`:

```jsx
<Routes>
  {/* Public: Anyone can visit */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected: Only logged-in users can visit */}
  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
    <Route path="/dashboard" element={<Dashboard />} />
    
    {/* Role-Guarded: Only Owners and Caretakers */}
    <Route 
      path="/properties" 
      element={
        <ProtectedRoute allowedRoles={["OWNER", "CARETAKER"]}>
          <PropertiesList />
        </ProtectedRoute>
      } 
    />
  </Route>
</Routes>
```

- **`<ProtectedRoute>`** inspects `useAuth()`. If `isAuthenticated` is `false`, it immediately redirects the visitor to `/login`.
- **`<AppLayout>`** contains the permanent `Sidebar` and `Navbar`, with an `<Outlet />` where the active page renders.

---

## 6. CSS Architecture & Design Tokens (Vanilla CSS)

Instead of using Tailwind classes that hide real CSS behind abbreviations, StayOS uses **CSS Custom Properties (Design Tokens)** in `src/styles/index.css`:

```css
:root {
  --bg-app: #080c14;
  --bg-card: #121a2b;
  --primary: #6366f1;
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  --radius-md: 10px;
}
```

### Benefits for Learning:
1. **Readable**: You see real CSS rules (`display: flex`, `grid-template-columns`, `backdrop-filter: blur(12px)`).
2. **Instant Theming**: If you want to change the primary brand color from indigo to emerald, you change `--primary: #10b981` once in `:root`, and every button, badge, and glow across the entire app updates instantly!
3. **Flexbox vs Grid**:
   - Use **Flexbox** for 1-dimensional rows or columns (e.g. Navbar items, button groups).
   - Use **Grid** for 2-dimensional layouts (e.g. Dashboard cards, Property grids).

---

## 7. How to Run and Experiment

1. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   # Runs on http://localhost:8000
   ```

2. **Start the Frontend Client**:
   ```bash
   cd client
   npm run dev
   # Runs on http://localhost:5173
   ```

3. Open `http://localhost:5173` in your browser.
4. Try logging in, adding a property, creating a room, and generating a rent record.
5. Open browser Developer Tools (`F12`), go to the **Network** tab, and watch how each click triggers asynchronous JSON requests to your Express backend!
