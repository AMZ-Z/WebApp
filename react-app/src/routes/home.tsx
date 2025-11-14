export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#001529', // fond sombre visible
        color: 'white',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>
        Bonjour 👋
      </h1>
      <p style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
        Ce projet a été réalisé par :
        <br />
        <br />
        <strong>
          Reda Chafik<br />
          Belhaj Ahmed Amine<br />
          Salah Eddine Bouddi<br />
          Aymane Ait Baaddi<br />
          El Mamouni Hidaya
        </strong>
      </p>
    </div>
  )
}
