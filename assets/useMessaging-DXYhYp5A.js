import{c as b,s as l,b as T,u as U}from"./index-DFAoHlto.js";import{r as i}from"./vendor-o8UMtg5z.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=b("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=b("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]),g={async sendMessage(r){try{const{data:{user:e},error:a}=await l.auth.getUser();if(a||!e)return{data:null,error:a||{message:"Not authenticated"}};const{data:o,error:u}=await this.getOrCreateConversation(e.id,r.recipient_id);if(u)return console.error("Error creating conversation:",u),{data:null,error:u};const{data:c,error:p}=await l.from("messages").insert({...r,sender_id:e.id,conversation_id:o.id}).select(`
          *,
          sender_profile:sender_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          recipient_profile:recipient_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `).single();return p?(console.error("Error inserting message:",p),{data:null,error:p}):(await l.from("conversations").update({last_message_id:c.id,last_message_at:new Date().toISOString()}).eq("id",o.id),{data:c,error:null})}catch(e){return console.error("Error in sendMessage:",e),{data:null,error:e}}},async getOrCreateConversation(r,e){try{const{data:a,error:o}=await l.from("conversations").select("*").or(`and(participant_1_id.eq.${r},participant_2_id.eq.${e}),and(participant_1_id.eq.${e},participant_2_id.eq.${r})`).maybeSingle();if(a)return{data:a,error:null};if(o&&o.code!=="PGRST116")return console.error("Error searching conversations:",o),{data:null,error:o};const{data:u,error:c}=await l.from("conversations").insert({participant_1_id:r,participant_2_id:e,last_message_at:new Date().toISOString()}).select("*").single();return c?(console.error("Error creating conversation:",c),{data:null,error:c}):{data:u,error:null}}catch(a){return console.error("Error in getOrCreateConversation:",a),{data:null,error:a}}},async getConversations(r){try{const{data:e,error:a}=await l.from("conversations").select(`
          *,
          participant_1_profile:participant_1_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          participant_2_profile:participant_2_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          last_message:last_message_id (
            id,
            content,
            sender_id,
            created_at
          )
        `).or(`participant_1_id.eq.${r},participant_2_id.eq.${r}`).order("last_message_at",{ascending:!1});return a?(console.error("Error fetching conversations:",a),{data:[],error:a}):{data:await Promise.all((e||[]).map(async u=>{try{const{count:c}=await l.from("messages").select("id",{count:"exact"}).eq("conversation_id",u.id).eq("recipient_id",r).eq("read",!1);return{...u,unread_count:c||0}}catch(c){return console.error("Error getting unread count:",c),{...u,unread_count:0}}})),error:null}}catch(e){return console.error("Error in getConversations:",e),{data:[],error:e}}},async getMessages(r,e=50){try{const{data:a,error:o}=await l.from("messages").select(`
          *,
          sender_profile:sender_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          recipient_profile:recipient_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `).eq("conversation_id",r).order("created_at",{ascending:!1}).limit(e);return o?(console.error("Error fetching messages:",o),{data:[],error:o}):{data:a?.reverse()||[],error:null}}catch(a){return console.error("Error in getMessages:",a),{data:[],error:a}}},async markMessagesAsRead(r,e){try{const{error:a}=await l.from("messages").update({read:!0}).eq("conversation_id",r).eq("recipient_id",e).eq("read",!1);return a&&console.error("Error marking messages as read:",a),{error:a}}catch(a){return console.error("Error in markMessagesAsRead:",a),{error:a}}},async getUnreadCount(r){try{const{count:e,error:a}=await l.from("messages").select("id",{count:"exact"}).eq("recipient_id",r).eq("read",!1);return a?(console.error("Error getting unread count:",a),{data:0,error:a}):{data:e||0,error:null}}catch(e){return console.error("Error in getUnreadCount:",e),{data:0,error:e}}},async deleteMessage(r){try{const{error:e}=await l.from("messages").delete().eq("id",r);return e&&console.error("Error deleting message:",e),{error:e}}catch(e){return console.error("Error in deleteMessage:",e),{error:e}}},async searchMessages(r,e){try{const{data:a,error:o}=await l.from("messages").select(`
          *,
          sender_profile:sender_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          recipient_profile:recipient_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `).or(`sender_id.eq.${r},recipient_id.eq.${r}`).or(`subject.ilike.%${e}%,content.ilike.%${e}%`).order("created_at",{ascending:!1}).limit(20);return o?(console.error("Error searching messages:",o),{data:[],error:o}):{data:a||[],error:null}}catch(a){return console.error("Error in searchMessages:",a),{data:[],error:a}}},subscribeToMessages(r,e){try{return l.channel(`messages_${r}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`recipient_id=eq.${r}`},e).subscribe()}catch(a){return console.error("Error subscribing to messages:",a),{unsubscribe:()=>{}}}},subscribeToConversations(r,e){try{return l.channel(`conversations_${r}`).on("postgres_changes",{event:"*",schema:"public",table:"conversations",filter:`or(participant_1_id.eq.${r},participant_2_id.eq.${r})`},e).subscribe()}catch(a){return console.error("Error subscribing to conversations:",a),{unsubscribe:()=>{}}}},async getConversation(r){try{const{data:e,error:a}=await l.from("conversations").select(`
          *,
          participant_1_profile:participant_1_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          participant_2_profile:participant_2_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `).eq("id",r).single();return a?(console.error("Error fetching conversation:",a),{data:null,error:a}):{data:e,error:null}}catch(e){return console.error("Error in getConversation:",e),{data:null,error:e}}},getDisplayName(r){return r?r.full_name||r.username||"Anonymous":"Unknown User"},getOtherParticipant(r,e){return r.participant_1_id===e?{id:r.participant_2_id,profile:r.participant_2_profile}:{id:r.participant_1_id,profile:r.participant_1_profile}}},R=()=>{const{user:r}=T(),{toast:e}=U(),[a,o]=i.useState([]),[u,c]=i.useState({}),[p,m]=i.useState(0),[w,y]=i.useState(!1),[C,E]=i.useState(!1),[M,v]=i.useState(null),_=i.useCallback(async()=>{if(!r){o([]);return}y(!0),v(null);try{const{data:n,error:t}=await g.getConversations(r.id);t?(console.error("Error loading conversations:",t),v("Failed to load conversations"),o([])):o(n||[])}catch(n){console.error("Error loading conversations:",n),v("Failed to load conversations"),o([])}finally{y(!1)}},[r]),h=i.useCallback(async n=>{if(r)try{const{data:t,error:s}=await g.getMessages(n);s?(console.error("Error loading messages:",s),c(d=>({...d,[n]:[]}))):c(d=>({...d,[n]:t||[]}))}catch(t){console.error("Error loading messages:",t),c(s=>({...s,[n]:[]}))}},[r]),k=i.useCallback(async n=>{if(!r)return{success:!1,error:"Not authenticated"};E(!0);try{const{data:t,error:s}=await g.sendMessage(n);if(s)return console.error("Error sending message:",s),e({title:"Error",description:"Failed to send message. Please try again.",variant:"destructive"}),{success:!1,error:s};e({title:"Message sent",description:"Your message has been sent successfully"}),await _();try{const{data:d}=await g.getOrCreateConversation(r.id,n.recipient_id);d&&await h(d.id)}catch(d){console.error("Error refreshing conversation:",d)}return{success:!0,data:t}}catch(t){return console.error("Error sending message:",t),e({title:"Error",description:"Failed to send message. Please try again.",variant:"destructive"}),{success:!1,error:t}}finally{E(!1)}},[r,e,_,h]),q=i.useCallback(async n=>{if(r)try{const{error:t}=await g.markMessagesAsRead(n,r.id);t?console.error("Error marking messages as read:",t):(o(s=>s.map(d=>d.id===n?{...d,unread_count:0}:d)),await f())}catch(t){console.error("Error marking messages as read:",t)}},[r]),f=i.useCallback(async()=>{if(!r){m(0);return}try{const{data:n,error:t}=await g.getUnreadCount(r.id);t?(console.error("Error loading unread count:",t),m(0)):m(n)}catch(n){console.error("Error loading unread count:",n),m(0)}},[r]),S=i.useCallback(async(n,t)=>{try{const{error:s}=await g.deleteMessage(n);s?(console.error("Error deleting message:",s),e({title:"Error",description:"Failed to delete message",variant:"destructive"})):(e({title:"Message deleted",description:"Message has been deleted"}),await h(t))}catch(s){console.error("Error deleting message:",s),e({title:"Error",description:"Failed to delete message",variant:"destructive"})}},[e,h]),$=i.useCallback(async n=>{if(!r||!n.trim())return[];try{const{data:t,error:s}=await g.searchMessages(r.id,n);return s?(console.error("Error searching messages:",s),[]):t||[]}catch(t){return console.error("Error searching messages:",t),[]}},[r]),x=i.useCallback(async n=>{if(!r)return null;try{const{data:t,error:s}=await g.getOrCreateConversation(r.id,n);return s?(console.error("Error getting conversation:",s),null):t}catch(t){return console.error("Error getting conversation:",t),null}},[r]);return i.useEffect(()=>{if(!r)return;let n,t;try{n=g.subscribeToMessages(r.id,s=>{console.log("New message received:",s),_(),f(),s.new&&s.new.sender_id!==r.id&&e({title:"New message",description:"You have a new message"})}),t=g.subscribeToConversations(r.id,s=>{console.log("Conversation updated:",s),_()})}catch(s){console.error("Error setting up subscriptions:",s)}return()=>{try{n&&n.unsubscribe(),t&&t.unsubscribe()}catch(s){console.error("Error unsubscribing:",s)}}},[r,_,f,e]),i.useEffect(()=>{r?(_(),f()):(o([]),c({}),m(0),v(null))},[r,_,f]),{conversations:a,messages:u,unreadCount:p,loading:w,sending:C,error:M,sendMessage:k,loadMessages:h,markAsRead:q,deleteMessage:S,searchMessages:$,getConversationWith:x,loadConversations:_,loadUnreadCount:f}};export{F as S,N as T,g as m,R as u};
