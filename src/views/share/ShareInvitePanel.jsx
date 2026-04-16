import Drawer from '@/components/ui/Drawer'
import Tabs from '@/components/ui/Tabs'
import ShareLinkTab from './components/ShareLinkTab'
import SendInvitesTab from './components/SendInvitesTab'
import AnalyticsTab from './components/AnalyticsTab'
import { TbLink, TbSend, TbChartBar, TbX } from 'react-icons/tb'

const { TabList, TabNav, TabContent } = Tabs

const CONTENT_TYPE_LABELS = {
    quiz: 'Quiz / Exam',
    practice_set: 'Practice Set',
    coding_test: 'Coding Test',
}

/**
 * ShareInvitePanel
 *
 * Usage:
 *   <ShareInvitePanel
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     contentType="quiz"        // "quiz" | "practice_set" | "coding_test"
 *     contentId={quiz.id}
 *     contentTitle={quiz.title}
 *   />
 */
const ShareInvitePanel = ({ isOpen, onClose, contentType, contentId, contentTitle }) => {
    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            placement="right"
            width={520}
            title={
                <div className="flex flex-col gap-0.5">
                    <span className="text-base font-semibold">Share &amp; Invite</span>
                    {contentTitle && (
                        <span className="text-xs text-gray-400 font-normal">
                            {CONTENT_TYPE_LABELS[contentType] || contentType}: {contentTitle}
                        </span>
                    )}
                </div>
            }
        >
            <div className="p-4 h-full overflow-y-auto">
                <Tabs defaultValue="link" variant="pill">
                    <TabList className="mb-5 gap-1 flex-wrap">
                        <TabNav value="link" className="flex items-center gap-1.5 text-sm">
                            <TbLink size={14} /> Share Link
                        </TabNav>
                        <TabNav value="invite" className="flex items-center gap-1.5 text-sm">
                            <TbSend size={14} /> Send Invites
                        </TabNav>
                        <TabNav value="analytics" className="flex items-center gap-1.5 text-sm">
                            <TbChartBar size={14} /> Analytics
                        </TabNav>
                    </TabList>

                    <TabContent value="link">
                        <ShareLinkTab
                            contentType={contentType}
                            contentId={contentId}
                            contentTitle={contentTitle}
                        />
                    </TabContent>

                    <TabContent value="invite">
                        <SendInvitesTab
                            contentType={contentType}
                            contentId={contentId}
                        />
                    </TabContent>

                    <TabContent value="analytics">
                        <AnalyticsTab
                            contentType={contentType}
                            contentId={contentId}
                        />
                    </TabContent>
                </Tabs>
            </div>
        </Drawer>
    )
}

export default ShareInvitePanel
