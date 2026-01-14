const AdminUserCreate = () => {
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', password: '', role: 'executant', managerId: '' 
  });
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    // Luăm doar userii care sunt manageri pentru a-i pune în lista de alocare
    axios.get(`${API_URL}/users`, { headers }).then(res => {
      setManagers(res.data.filter(u => u.role === 'manager'));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/admin/create-user`, formData, { headers });
    alert("Utilizator creat!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Nume" onChange={e => setFormData({...formData, firstName: e.target.value})} />
      <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
      <input placeholder="Parola" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
      
      <select onChange={e => setFormData({...formData, role: e.target.value})}>
        <option value="executant">Executant</option>
        <option value="manager">Manager</option>
      </select>

      {/* Dacă e executant, îi alegem un manager */}
      {formData.role === 'executant' && (
        <select onChange={e => setFormData({...formData, managerId: e.target.value})}>
          <option value="">Alege Manager...</option>
          {managers.map(m => <option key={m.id} value={m.id}>{m.firstName}</option>)}
        </select>
      )}
      <button type="submit">Creează Utilizator</button>
    </form>
  );
};
export default Dashboard;