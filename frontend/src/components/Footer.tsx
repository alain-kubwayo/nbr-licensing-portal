const Footer = () => {
  return (
    <footer>
        <div className='text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
            <p className='text-sm text-balance max-sm:text-center'>
            <span>&copy;</span>{`${new Date().getFullYear()}`}{' '}
            <a href='#' className='text-primary'>
                BNR Licensing App
            </a>
            , All rights reserved.
            </p>
        </div>
    </footer>
  )
}

export default Footer
