import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Dentro do seu componente:
const router = useRouter()

// No JSX do seu banner:
<button 
  onClick={() => router.push('/login')} 
  className="button-class-aqui"
>
  Fazer Login
</button> 