import 'react-hook-form'
import { z } from 'zod'

declare module 'react-hook-form' {
  interface UseFormProps<TFormValues> {
    resolver?: any
    defaultValues?: Partial<TFormValues>
    mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all'
    reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur'
    criteriaMode?: 'firstError' | 'all'
    shouldFocusError?: boolean
    shouldUnregister?: boolean
  }
} 