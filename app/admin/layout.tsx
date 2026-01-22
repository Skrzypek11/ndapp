import Sidebar from "@/components/Sidebar"
import ProfilePanel from "@/components/profile/ProfilePanel"
import styles from "../dashboard/layout.module.css"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.container}>
            <div className={styles.backgroundLayer}>
                <div className={styles.bgImage} />
                <div className={styles.vignette} />
            </div>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
            <ProfilePanel />
        </div>
    )
}
