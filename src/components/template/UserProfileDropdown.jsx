import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { useNavigate } from 'react-router'
import {
    PiUserDuotone,
    PiSignOutDuotone,
} from 'react-icons/pi'
import { useAuth } from '@/auth'

const _UserDropdown = () => {
    const { avatar, userName, email } = useSessionUser((state) => state.user)
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const avatarProps = {
        ...(avatar ? { src: avatar } : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {userName || 'Anonymous'}
                        </div>
                        <div className="text-xs">
                            {email || 'No email available'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="profile"
                className="gap-2"
                onClick={() => navigate('/account/profile')}
            >
                <span className="text-xl"><PiUserDuotone /></span>
                <span>My Profile</span>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={() => signOut()}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
