import { Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { NavLink } from 'react-router-dom';

const NavButton = ({ children, to }: { children: ReactNode; to: string }) => (
  <Link
    as={NavLink}
    to={to}
    exact
    fontWeight="bold"
    activeStyle={{
      color: 'white'
    }}
    _hover={{}}
    _focus={{}}
    color="lightgray"
    fontSize="1.1em"
  >
    {children}
  </Link>
);

export default NavButton;