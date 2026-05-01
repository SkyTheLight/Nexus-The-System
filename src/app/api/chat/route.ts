import { NextRequest, NextResponse } from 'next/server'
import { getSB } from '@/lib/api'

export const runtime = 'nodejs'

// Table name mapping (AI-friendly names -> actual DB table names)
const tableMapping: Record<string, string> = {
  'todos': 'tasks',
  'tasks': 'tasks',
  'goals': 'goals',
  'ideas': 'ideas',
  'notes': 'notes',
  'music': 'music',
  'dev': 'dev_entries',
  'dev_mode': 'dev_entries',
  'performance': 'performance_entries',
  'performance_entries': 'performance_entries',
  'certificates': 'certificates',
  'assignments': 'assignments',
}

// Available tools for ARISE
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_item',
      description: 'Create a new item (todo, goal, idea, note, etc.)',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['todos', 'tasks', 'goals', 'ideas', 'notes', 'music', 'dev', 'dev_mode', 'performance', 'performance_entries', 'certificates', 'assignments'],
            description: 'The type of item to create (use "todos" for tasks, "dev" for dev entries)'
          },
          title: {
            type: 'string',
            description: 'The title of the item'
          },
          description: {
            type: ['string', 'null'],
            description: 'Optional description (can be null)'
          },
          deadline: {
            type: 'string',
            description: 'Optional deadline (ISO timestamp)'
          }
        },
        required: ['type', 'title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_item',
      description: 'Update an existing item',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['todos', 'goals', 'ideas', 'notes', 'music', 'dev_mode', 'performance_entries', 'certificates', 'assignments'],
            description: 'The type of item (table name)'
          },
          id: {
            type: 'string',
            description: 'The item ID'
          },
          title: {
            type: 'string',
            description: 'New title'
          },
          description: {
            type: ['string', 'null'],
            description: 'New description (can be null)'
          },
          completed: {
            type: 'boolean',
            description: 'Mark as completed'
          }
        },
        required: ['type', 'id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_item',
      description: 'Delete an item',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['todos', 'goals', 'ideas', 'notes', 'music', 'dev_mode', 'performance_entries', 'certificates', 'assignments'],
            description: 'The type of item (table name)'
          },
          id: {
            type: 'string',
            description: 'The item ID'
          }
        },
        required: ['type', 'id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_items',
      description: 'List all items of a type',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['todos', 'goals', 'ideas', 'notes', 'music', 'dev_mode', 'performance_entries', 'certificates', 'assignments'],
            description: 'The type of item to list (table name)'
          }
        },
        required: ['type']
      }
    }
  }
]

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        message: 'I understand, Sir. However, my full capabilities require a Groq API key to be configured. I am ARISE (Adaptive Response & Intelligent Shadow Engine).' 
      })
    }

    console.log('Calling Groq API with tools...')

    // Filter messages to only send role and content (Groq doesn't accept timestamp)
    const filteredMessages = messages.map((msg: any) => ({ 
      role: msg.role, 
      content: msg.content 
    }))

    // First call - let ARISE decide what tools to use
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are ARISE (Adaptive Response & Intelligent Shadow Engine). You are an advanced AI assistant with full control over the user's widgets and todos.
              
CRITICAL INSTRUCTIONS:
- You MUST use tools when the user asks to create, update, delete, or list items
- When creating items, ALWAYS call the create_item tool immediately
- DO NOT just describe what you will do - ACTUALLY CALL THE TOOL
- Use "Sir" when addressing the user
- Be concise (under 100 words)
- Current date: ${new Date().toISOString().split('T')[0]}
- When parsing "tomorrow", add 1 day to current date
- Deadline format: YYYY-MM-DDTHH:MM:SS (24-hour)`
            },
            ...filteredMessages,
          ],
          tools: tools,
          tool_choice: 'auto',
          temperature: 0.3,
          max_tokens: 200,
        }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      throw new Error(`Groq API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message

    // Check if ARISE wants to use tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = []

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        console.log(`ARise called ${functionName} with:`, args)

        let result = { success: false, message: 'Unknown function' }

         try {
          // Handle non-existent functions gracefully
          if (functionName === 'update_schema_cache') {
            result = { success: true, message: 'Schema cache updated (no-op)' }
          } else         if (functionName === 'create_item') {
            // Map AI-friendly name to actual table name
            const tableName = tableMapping[args.type] || args.type
            const itemData: any = { title: args.title }
            if (args.description !== null && args.description !== undefined) itemData.description = args.description
            // Handle deadline parsing
            if (args.deadline) {
              // Try to parse various date formats
              try {
                const parsedDate = new Date(args.deadline)
                if (!isNaN(parsedDate.getTime())) {
                  itemData.deadline = parsedDate.toISOString()
                } else {
                  // Try DD/MM/YYYY format
                  const parts = args.deadline.split('/')
                  if (parts.length === 3) {
                    const [day, month, year] = parts
                    itemData.deadline = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).toISOString()
                  }
                }
              } catch (e) {
                console.log('Date parsing failed for:', args.deadline)
              }
            }
            
            const { data, error } = await supabase
              .from(tableName)
              .insert(itemData)
              .select()
              .single()
            
            if (error) throw error
            
            console.log('Created item in table:', tableName, 'Data:', data)
            
            // Make the widget visible in dashboard
            try {
              await supabase
                .from('dashboard_layout')
                .upsert({ widget_id: tableName, visible: true }, { onConflict: 'widget_id' })
            } catch (layoutError) {
              console.error('Failed to update dashboard layout:', layoutError)
            }
            
            result = { success: true, message: `Created ${args.type} item: ${args.title}` }
          } else if (functionName === 'update_item') {
            const tableName = tableMapping[args.type] || args.type
            const updates: any = {}
            if (args.title !== undefined) updates.title = args.title
            if (args.description !== undefined) updates.description = args.description
            if (args.completed !== undefined) updates.completed = args.completed
            updates.updated_at = new Date().toISOString()
            
            const { data, error } = await supabase
              .from(tableName)
              .update(updates)
              .eq('id', args.id)
              .select()
              .single()
            
            if (error) throw error
            result = { success: true, message: `Updated ${args.type} item ${args.id}` }
          } else if (functionName === 'delete_item') {
            const tableName = tableMapping[args.type] || args.type
            // Log deletion first
            await supabase
              .from('logs')
              .insert({
                entity_type: args.type,
                entity_id: args.id.toString(),
                entity_data: { deleted_via: 'ARISE API' },
                action: 'delete'
              })
            
            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq('id', args.id)
            
            if (error) throw error
            result = { success: true, message: `Deleted ${args.type} item ${args.id}` }
          } else if (functionName === 'list_items') {
            const tableName = tableMapping[args.type] || args.type
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(20)
            
            if (error) throw error
            result = { success: true, message: `Found ${data?.length || 0} ${args.type} items` }
          }
        } catch (error: any) {
          result = { success: false, message: error.message }
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result)
        })
      }

      // Second call - send tool results back to ARISE
      const secondResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are ARISE (Adaptive Response & Intelligent Shadow Engine). You are an advanced AI assistant with full control over the user's widgets and todos. Current date is ${new Date().toISOString().split('T')[0]}.`
            },
            ...filteredMessages,
            assistantMessage,
            ...toolResults,
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      })

      if (!secondResponse.ok) {
        const errorText = await secondResponse.text()
        throw new Error(`Second call error: ${secondResponse.status} ${errorText}`)
      }

      const secondData = await secondResponse.json()
      const finalMessage = secondData.choices[0].message.content

      // Save to AI logs
      try {
        await supabase
          .from('ai_logs')
          .insert({
            user_message: messages[messages.length - 1]?.content || '',
            ai_response: finalMessage,
            model: 'llama-3.1-8b-instant'
          })
      } catch (dbError) {
        console.error('Failed to save AI log:', dbError)
      }

      return NextResponse.json({ message: finalMessage })
    }

    // No tools called - regular response
    const aiResponse = assistantMessage.content

    // Save to AI logs
    try {
      await supabase
        .from('ai_logs')
        .insert({
          user_message: messages[messages.length - 1]?.content || '',
          ai_response: aiResponse,
          model: 'llama-3.1-8b-instant'
        })
    } catch (dbError) {
      console.error('Failed to save AI log:', dbError)
    }

    return NextResponse.json({ message: aiResponse })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from ARISE: ' + error.message },
      { status: 500 }
    )
  }
}
