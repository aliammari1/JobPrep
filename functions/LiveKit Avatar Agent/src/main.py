"""
LiveKit Avatar Agent - Appwrite Serverless Function
Spawns a Simli avatar in a LiveKit interview room using direct API calls

This is a clean implementation using Simli REST API instead of the agents framework
"""
import os
import json
import asyncio
from typing import Any, Dict
from livekit import rtc, api
import aiohttp


async def spawn_avatar(room_name: str) -> None:
    """
    Spawn Simli avatar using direct API integration
    
    Flow:
    1. Create Simli audio-to-video session
    2. Start LiveKit agents session with Simli
    3. Keep connection alive
    """
    # Get credentials
    livekit_url = os.environ.get("LIVEKIT_URL", "")
    livekit_api_key = os.environ.get("LIVEKIT_API_KEY", "")
    livekit_api_secret = os.environ.get("LIVEKIT_API_SECRET", "")
    simli_api_key = os.environ.get("SIMLI_API_KEY", "")
    simli_face_id = os.environ.get("SIMLI_FACE_ID", "")
    
    # Validate credentials
    if not all([livekit_url, livekit_api_key, livekit_api_secret]):
        raise ValueError("Missing LiveKit credentials")
    if not all([simli_api_key, simli_face_id]):
        raise ValueError("Missing Simli credentials")
    
    print(f"🚀 Starting Simli avatar for room: {room_name}")
    
    async with aiohttp.ClientSession() as session:
        try:
            # Step 1: Start Simli audio-to-video session
            print(f"🎭 Creating Simli session...")
            simli_response = await session.post(
                "https://api.simli.ai/startAudioToVideoSession",
                json={
                    "apiKey": simli_api_key,
                    "faceId": simli_face_id,
                    "syncAudio": True,
                    "handleSilence": True,
                    "maxSessionLength": 900,  # 15 minutes
                    "maxIdleTime": 120,  # 2 minutes idle timeout
                }
            )
            simli_response.raise_for_status()
            simli_data = await simli_response.json()
            session_token = simli_data["session_token"]
            print(f"✅ Simli session created: {session_token[:20]}...")
            
            # Step 2: Generate LiveKit token for avatar
            livekit_token = (
                api.AccessToken(livekit_api_key, livekit_api_secret)
                .with_identity("simli-avatar")
                .with_name("AI Interviewer")
                .with_grants(api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                ))
                .to_jwt()
            )
            
            # Step 3: Start LiveKit agents session with Simli
            print(f"📞 Starting LiveKit-Simli integration...")
            livekit_response = await session.post(
                "https://api.simli.ai/StartLivekitAgentsSession",
                json={
                    "session_token": session_token,
                    "livekit_token": livekit_token,
                    "livekit_url": livekit_url,
                }
            )
            livekit_response.raise_for_status()
            print(f"✅ Avatar connected to room successfully!")
            
            # Step 4: Keep function alive to maintain avatar session
            print(f"⏳ Avatar session active (will run for 15 minutes)...")
            await asyncio.sleep(900)
            
            print(f"✅ Avatar session completed")
            
        except aiohttp.ClientError as e:
            print(f"❌ API Error: {str(e)}")
            raise
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
import os
import json
import asyncio
from typing import Any, Dict
from livekit import rtc, api
from livekit.agents import AgentSession
from livekit.plugins import simli, google
import aiohttp


async def spawn_avatar(room_name: str) -> None:
    """
    Spawn Simli avatar in LiveKit room using official pattern
    
    Steps:
    1. Connect to LiveKit room
    2. Create AgentSession with Gemini LLM
    3. Create and start Simli AvatarSession
    """
    # Get credentials
    livekit_url = os.environ.get("LIVEKIT_URL", "")
    livekit_api_key = os.environ.get("LIVEKIT_API_KEY", "")
    livekit_api_secret = os.environ.get("LIVEKIT_API_SECRET", "")
    simli_api_key = os.environ.get("SIMLI_API_KEY", "")
    simli_face_id = os.environ.get("SIMLI_FACE_ID", "")
    google_api_key = os.environ.get("GOOGLE_API_KEY", "")
    
    # Validate credentials
    if not all([livekit_url, livekit_api_key, livekit_api_secret]):
        raise ValueError("Missing LiveKit credentials")
    if not all([simli_api_key, simli_face_id]):
        raise ValueError("Missing Simli credentials")
    if not google_api_key:
        raise ValueError("Missing Google API key")
    
    print(f"🚀 Starting avatar for room: {room_name}")
    
    # Create and connect to room
    room = rtc.Room()
    try:
        # Generate access token
        token = api.AccessToken(livekit_api_key, livekit_api_secret) \
            .with_identity("simli-avatar") \
            .with_name("AI Interviewer") \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )).to_jwt()
        
        # Connect to room
        print(f"� Connecting to room...")
        await room.connect(livekit_url, token)
        print(f"✅ Connected to room: {room_name}")
        
        # Create HTTP session for Simli plugin (required outside job context)
        http_session = aiohttp.ClientSession()
        
        try:
            # Set HTTP session in the context BEFORE creating AvatarSession
            # The http_context uses a ContextVar that expects a factory function
            from livekit.agents.utils import http_context
            http_context._ContextVar.set(lambda: http_session)
            
            # Create agent session with Gemini LLM
            session = AgentSession(
                llm=google.LLM(
                    model="gemini-1.5-flash",
                    api_key=google_api_key,
                ),
            )
            
            # Create Simli avatar (will use the http_context session we just set)
            simli_avatar = simli.AvatarSession(
                simli_config=simli.SimliConfig(
                    api_key=simli_api_key,
                    face_id=simli_face_id,
                ),
            )
            
            # Start avatar with session and room object
            print(f"🎭 Starting Simli avatar...")
            await simli_avatar.start(session, room=room)
            print(f"✅ Avatar started successfully")
        
            # Keep alive for session duration (900s = 15min)
            print(f"⏳ Avatar session active...")
            await asyncio.sleep(900)
            
        finally:
            # Clean up HTTP session
            await http_session.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await room.disconnect()
        print(f"👋 Avatar disconnected")



async def main(context: Any) -> Dict[str, Any]:
    """
    Appwrite function entry point
    Expects JSON payload with:
    - roomName: LiveKit room name
    - participantName: Name for the avatar participant (default: "AI Interviewer")
    """
    try:
        # Parse request
        if hasattr(context, 'req'):
            payload = context.req.body_json
        else:
            payload = json.loads(context.get("req", {}).get("body", "{}"))
        
        room_name = payload.get("roomName")
        participant_name = payload.get("participantName", "AI Interviewer")
        
        if not room_name:
            return context.res.json({
                "success": False,
                "error": "roomName is required"
            }, 400)
        
        # Run the avatar spawning coroutine
        # This will block until the function times out (900s)
        # or the avatar disconnects
        await spawn_avatar(room_name)
        
        return context.res.json({
            "success": True,
            "message": f"Avatar session ended for room: {room_name}"
        })
        
    except Exception as e:
        print(f"❌ Function error: {str(e)}")
        import traceback
        traceback.print_exc()
        return context.res.json({
            "success": False,
            "error": str(e)
        }, 500)
