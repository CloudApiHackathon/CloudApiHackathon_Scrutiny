import {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useState,
} from 'react';
import {
  DefaultParticipantViewUIProps,
  DefaultScreenShareOverlay,
  hasAudio,
  hasScreenShare,
  isPinned,
  MenuToggle,
  OwnCapability,
  ParticipantActionsContextMenu,
  ToggleMenuButtonProps,
  useCall,
  useCallStateHooks,
  useParticipantViewContext,
} from '@stream-io/video-react-sdk';
import clsx from 'clsx';

import Keep from './icons/Keep';
import KeepFilled from './icons/KeepFilled';
import KeepOffFilled from './icons/KeepOffFilled';
import KeepPublicFilled from './icons/KeepPublicFilled';
import MicOffFilled from './icons/MicOffFilled';
import SpeechIndicator from './SpeechIndicator';
import VisualEffects from './icons/VisualEffects';
import MoreVert from './icons/MoreVert';
import MicFilled from './icons/MicFilled';


export const speechRingClassName = 'speech-ring';
export const menuOverlayClassName = 'menu-overlay';

const ParticipantViewUI = () => {
  const call = useCall();
  const { useHasPermissions } = useCallStateHooks();
  const { participant, trackType } = useParticipantViewContext();
  const [showMenu, setShowMenu] = useState(false);

  const {
    pin,
    sessionId,
    isLocalParticipant,
    isSpeaking,
    isDominantSpeaker,
    userId,
  } = participant;
  const isScreenSharing = hasScreenShare(participant);
  const hasAudioTrack = hasAudio(participant);
  const canUnpinForEveryone = useHasPermissions(OwnCapability.PIN_FOR_EVERYONE);
  const pinned = isPinned(participant);

  const unpin = () => {
    if (pin?.isLocalPin || !canUnpinForEveryone) {
      call?.unpin(sessionId);
    } else {
      call?.unpinForEveryone({
        user_id: userId,
        session_id: sessionId,
      });
    }
  };

  if (isLocalParticipant && isScreenSharing && trackType === 'screenShareTrack')
    return (
      <>
        <DefaultScreenShareOverlay />
        <ParticipantDetails />
      </>
    );

  return (
    <>
      <ParticipantDetails />
      {/* Menu Overlay */}
      <div
        onMouseOver={() => {
          setShowMenu(true);
        }}
        onMouseOut={() => setShowMenu(false)}
        className={`z-1 left-1/2 top-1/2 w-full h-full rounded-xl bg-transparent ${menuOverlayClassName}`}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
};

const ParticipantDetails = ({}: Pick<
  DefaultParticipantViewUIProps,
  'indicatorsVisible'
>) => {
  const { participant } = useParticipantViewContext();
  const { pin, name, userId } = participant;
  const pinned = !!pin;

  return (
    <>
    <div className="z-1 absolute left-0 bottom-[.65rem] max-w-94 h-fit truncate font-medium text-white text-sm flex items-center justify-start gap-4 mt-1.5 mx-4 mb-0 cursor-default select-none">
      {pinned && (pin.isLocalPin ? <KeepFilled /> : <KeepPublicFilled />)}
      <span
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.7)', // Enhanced shadow for depth
          display: 'flex',
          alignItems: 'center', // Center vertically
          justifyContent: 'center', // Center horizontally
          border: pinned ? 'none' : '2px solid rgba(255, 255, 255, 0.8)', // Circular border
          borderRadius: '50%', // Perfect circle
          width: pinned ? 'auto' : '4rem', // Ensure equal width and height
          height: pinned ? 'auto' : '4rem', // Ensure equal width and height
          backgroundColor: pinned ? 'transparent' : 'rgba(255, 255, 255, 0.2)', // Light background when not pinned
          color: pinned ? 'inherit' : 'rgba(255, 255, 255, 0.9)', // Bright text color
          transition: 'all 0.3s ease-in-out', // Smooth transition for state changes
          fontSize: '0.875rem', // Adjust font size to fit inside the circle
          whiteSpace: 'normal', // Allow text to break lines
          wordBreak: 'break-word', // Ensure long words break into new lines
          overflowWrap: 'break-word', // Wrap text to prevent overflow
          textAlign: 'center', // Center text within the span
        }}
      >
        {name.length > 10 ? name.slice(0, 8) + '...' : name || userId}
      </span>
    </div>

    </>
  );
};

const Button = forwardRef(function Button(
  {
    icon,
    onClick = () => null,
    menuShown,
    ...rest
  }: {
    icon: ReactNode;
    onClick?: () => void;
  } & ComponentProps<'button'> & { menuShown?: boolean },
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      {...rest}
      ref={ref}
      className="h-11 w-11 rounded-full p-2.5 bg-transparent border-transparent outline-none hover:bg-[rgba(232,234,237,.15)] transition-[background] duration-150 ease-linear"
    >
      {icon}
    </button>
  );
});

const PinMenuToggleButton = forwardRef<
  HTMLButtonElement,
  ToggleMenuButtonProps
>(function ToggleButton(props, ref) {
  return <Button {...props} title="Pin" ref={ref} icon={<Keep />} />;
});

const OtherMenuToggleButton = forwardRef<
  HTMLButtonElement,
  ToggleMenuButtonProps
>(function ToggleButton(props, ref) {
  return (
    <Button {...props} title="More options" ref={ref} icon={<MoreVert />} />
  );
});

export default ParticipantViewUI;
