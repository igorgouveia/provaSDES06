import { useState } from 'react'
import { z } from 'zod'

export function useFormValidation<T extends z.ZodType<any, any>>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: z.infer<T>) => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  return {
    errors,
    validate,
    setErrors
  }
} 