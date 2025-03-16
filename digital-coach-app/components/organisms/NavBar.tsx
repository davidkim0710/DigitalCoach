import Link from "next/link";
import Button from "../atoms/Button";
import style from "./Navbar.module.scss";
import LogoutIcon from "@mui/icons-material/Logout";
import useAuthContext from "@App/lib/auth/AuthContext";

export default function NavBar() {
  const { logout } = useAuthContext();

  return (
    <div className={style.main}>
      <div className={style.barcontainer}>
        <Link href="/">
          <a className={style.logo_text}>Digital Coach</a>
        </Link>
        <div className={style.links}>
          <Link href="/home">
            <a className={style.linksText}>Home</a>
          </Link>
          <Link href="/">
            <a className={style.linksText}>Dashboard</a>
          </Link>
          <Link href="/video">
            <a className={style.linksText}>Record a Mock Interview</a>
          </Link>
          <Link href="/storytelling">
            <a className={style.linksText}>Practice Storytelling</a>
          </Link>
          <Link href="/naturalconversation">
            <a className={style.linksText}>Natural Conversation</a>
          </Link>
          {/* <Link href='/start'>
            <a className={style.linksText}>Start an Interview</a>
          </Link> */}
          {/* <Link href='/past'>
            <a className={style.linksText}>Review Past Interviews</a>
          </Link> */}
          <Link href="/start/custom">
            <a className={style.linksText}>Create Custom Question Set</a>
          </Link>
          {/*Here while developing, can be removed later if desired */}
          <Link href="/connections">
            <a className={style.linksText}>Connections</a>
          </Link>
          <Link href="/progress">
            <a className={style.linksText}>Progress Tracking</a>
          </Link>
          <Link href="/profile">
            <a className={style.linksText}>Profile</a>
          </Link>
        </div>

        <Button onClick={logout} className={style.logout}>
          <LogoutIcon />
          <div>Log out</div>
        </Button>
      </div>
    </div>
  );
}
