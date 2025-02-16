import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <div className='h-[100%] w-[150px] fixed top-0 left-0 p-[20px] bg-gray-800'>
      <div className='px-[25px] font-[15px]'>
        <Link href="/">
          <Image src="/logo.png" width={70} height={70} alt='logo' className='my-2' />
        </Link>
        <Link href="/about" className='block mt-4 text-white hover:bg-gray-700 p-2 rounded'>About</Link>
      </div>
    </div>
  );
};

export default Navbar;