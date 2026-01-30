import RoleSelect from "./RoleSelect";

export default function LoginForm({ 
  email, setEmail, 
  password, setPassword, 
  role, setRole, 
  error, onSubmit 
}) {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">StitchFlow</h1>
        <p className="text-gray-500 mt-2">Internal Management Access</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <RoleSelect value={role} onChange={setRole} />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            placeholder="name@stitchflow.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}